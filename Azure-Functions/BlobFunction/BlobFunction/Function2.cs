using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;

namespace BlobFunction
{

    //  */2 * * * * -- 2 min
    //  */30 * * * * * -- 30 sec
    public static class Function2
    {
        [FunctionName("Function2")]
        public static void Run([TimerTrigger("*/30 * * * * *", RunOnStartup = true)] TimerInfo myTimer, ILogger log)
        {
            
            Converter converter = new Converter();
            Task<List<string>> task = converter.conn.GetListOfFiles();
            task.Wait();
            List<string> files = task.Result;
            List<string> csvFiles = files.Where(s => (Path.GetExtension(s) == ".csv")).ToList();
            List<string> nonCsvFiles = files.Where(s => (Path.GetExtension(s) != ".csv")).ToList();
            //List<string> convertibleFiles = new List<string>();
            foreach (string file in nonCsvFiles) {
                if (!csvFiles.Contains(string.Join(".",file.Split(".").SkipLast(1).Append("csv")))) {
                    log.LogInformation(file);
                    Task conversionTask = Task.Factory.StartNew(() => converter.ConvertUsingExcelLibrary(file));
                    conversionTask.Wait();
                    return;
                }
            }
            log.LogInformation("No file to update");
        }

        
    }
}
