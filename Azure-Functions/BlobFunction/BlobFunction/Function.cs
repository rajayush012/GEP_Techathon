using ExcelDataReader.Log;
using GEP.Techathon.API;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.File;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace BlobFunction
{ 
    //  */2 * * * * -- 2 min
    //  */30 * * * * * -- 30 sec
    public static class Function
    {
        [FunctionName("Function")]
        public static void Run([TimerTrigger("*/30 * * * * *", RunOnStartup = true)] TimerInfo myTimer, ILogger log)
        {
            Task refininglogs = refineLogs();
            Converter converter = new Converter();
            Task<List<string>> task = converter.conn.GetListOfFiles();
            task.Wait();
            List<string> files = task.Result;
            List<string> csvFiles = files.Where(s => (Path.GetExtension(s) == ".csv")).Select(s => string.Join(".",s.Split(new char[] { '.', '^' }).Where(s => !s.StartsWith("&")))).ToList();
            List<string> nonCsvFiles = files.Where(s => (Path.GetExtension(s) != ".csv")).ToList();
            
            foreach (string file in nonCsvFiles)
            {
                if (!csvFiles.Contains(string.Join(".", file.Split(".").SkipLast(1).Append("csv"))))
                {
                    log.LogInformation(file);
                    
                    Task conversionTask = Task.Factory.StartNew(() => converter.ConvertUsingExcelLibrary(file));
                    conversionTask.Wait();
                    refininglogs.Wait();
                    return;
                }
            }
            log.LogInformation("No file to update");
            
        }

        private static async Task refineLogs()
        {
            StorageConnection conn = new StorageConnection();
            string connectionString = "DefaultEndpointsProtocol=https;AccountName=storageaccountgepte86f5;AccountKey=tWMNBa2qlEgVEt6cOnmDbYdsJ0igQmnmJzcJx2d5lxuf0y1iYyMEbkM9n8KlUfPvlSF9Mtc3KE5CrhAWy/fpAg==;EndpointSuffix=core.windows.net";
            conn.config = new MyConfig() { StorageConnection = connectionString, Container = "techathoninput" };
            conn.Connect();
            CloudStorageAccount sAccount = conn.storageAccount;
            CloudFileClient fileClient = sAccount.CreateCloudFileClient();

            CloudFileShare share = fileClient.GetShareReference("scheduledfileconverter91d0");

            if (await share.ExistsAsync())
            {
                CloudFileDirectory rootDir = share.GetRootDirectoryReference();
                CloudFileDirectory dir = rootDir.GetDirectoryReference(@"LogFiles/Application/Functions/Function/Function");
                CloudFile logs = rootDir.GetFileReference("Logs.txt");
                if (await dir.ExistsAsync())
                {
                    
                    List<IListFileItem> results = new List<IListFileItem>();
                    FileContinuationToken token = null;
                    do
                    {
                        FileResultSegment resultSegment = await dir.ListFilesAndDirectoriesSegmentedAsync(token);
                        results.AddRange(resultSegment.Results);
                        token = resultSegment.ContinuationToken;
                    }
                    while (token != null);
                    List<CloudFile> files = new List<CloudFile>();
                    foreach (IListFileItem item in results) {
                        if (item.GetType() == typeof(Microsoft.WindowsAzure.Storage.File.CloudFile))
                        {
                            files.Add((CloudFile)item);
                        }
                    }
                    string name = "";
                    foreach (CloudFile file in files) { 
                        name = (string.Compare(name,Path.GetFileNameWithoutExtension(file.Name)) > 0) ? name : Path.GetFileNameWithoutExtension(file.Name);
                    }
                    name += ".log";
                    CloudFile recentFile = dir.GetFileReference(name);
                    string data = await recentFile.DownloadTextAsync();
                    string[] lines = data.Split("\n");
                    if (lines.Length < 50)
                    {
                        await logs.UploadTextAsync(data);
                    }
                    else {
                        await logs.UploadTextAsync(string.Join("\n", lines.Skip(lines.Length - 50).ToArray()));
                    }  
                }
            }
        }
    }
}
