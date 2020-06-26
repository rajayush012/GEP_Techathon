using BlobFunction.Extensions;
using ExcelDataReader;
using GEP.Techathon.API;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BlobFunction
{
    class Converter
    {
        private string[] excelFormats = { ".xls", ".xlsm", ".xlsx" };
        public StorageConnection conn;

        public Converter()
        {
            Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
            this.conn = new StorageConnection();
            string connectionString = "DefaultEndpointsProtocol=https;AccountName=storageaccountgepte86f5;AccountKey=tWMNBa2qlEgVEt6cOnmDbYdsJ0igQmnmJzcJx2d5lxuf0y1iYyMEbkM9n8KlUfPvlSF9Mtc3KE5CrhAWy/fpAg==;EndpointSuffix=core.windows.net";
            conn.config = new MyConfig() { StorageConnection = connectionString, Container = "techathoninput" };
            conn.Connect();
        }
        public void ConvertUsingExcelLibrary(string path)
        {
            if (excelFormats.Contains(Path.GetExtension(path)))
            {
                ExcelToCsv(path);
            }
            else
            {
                string newPath = string.Join(".", path.Split(".").SkipLast(1).Append("csv"));
                CloudBlobClient client = conn.storageAccount.CreateCloudBlobClient();
                CloudBlobContainer container = client.GetContainerReference(conn.config.Container);
                Task checkExists = container.CreateIfNotExistsAsync();
                checkExists.Wait();
                CloudBlockBlob blob = container.GetBlockBlobReference(path);
                CloudBlockBlob newBlob = container.GetBlockBlobReference(newPath);
                blob.Properties.ContentType = "application/json";
                newBlob.Properties.ContentType = "application/json";
                Stream myBlob = blob.OpenReadAsync().Result;
                var dataBytes = StreamExtensions.ReadToEnd(myBlob);
                using (Stream stream = new MemoryStream(dataBytes, 0, dataBytes.Length))
                {
                    Task t = newBlob.UploadFromStreamAsync(stream);
                    t.Wait();
                }
            }
        }
        private void ExcelToCsv(string path)
        {
            StringBuilder builder = new StringBuilder();
            CloudBlobClient client = conn.storageAccount.CreateCloudBlobClient();
            CloudBlobContainer container = client.GetContainerReference(conn.config.Container);
            Task checkExists = container.CreateIfNotExistsAsync();
            checkExists.Wait();
            CloudBlockBlob blob;
            blob = container.GetBlockBlobReference(path);
            blob.Properties.ContentType = "application/json";
            using (var blobStream = blob.OpenReadAsync().Result)
            {
                using (var rdr = (Path.GetExtension(path) == ".xls") ? ExcelReaderFactory.CreateBinaryReader(blobStream) : ExcelReaderFactory.CreateOpenXmlReader(blobStream))
                {
                    do
                    {
                        while (rdr.Read())
                        {
                            for (int i = 0; i < rdr.FieldCount; i++)
                            {
                                var data = rdr.GetValue(i);
                                if (data != null)
                                {
                                    builder.Append(returnWithQuotes(data.ToString()) + ",");
                                }
                                else
                                {
                                    builder.Append(",");
                                }
                            }
                            builder.Remove(builder.Length - 1, 1);
                            builder.AppendLine();
                        }
                        string[] arr = path.Split(".").SkipLast(1).ToArray();
                        arr[arr.Length - 1] = arr.Last() + "^&" + rdr.Name;
                        string newPath = string.Join(".", arr.Append("csv"));
                        CloudBlockBlob newBlob;
                        newBlob = container.GetBlockBlobReference(newPath);
                        newBlob.Properties.ContentType = "application/json";
                        BlobRequestOptions options = new BlobRequestOptions
                        {
                            ParallelOperationThreadCount = 8,
                            DisableContentMD5Validation = true,
                            StoreBlobContentMD5 = false
                        };
                        // block size of 10 MB
                        newBlob.StreamWriteSizeInBytes = 10 * 1024 * 1024;
                        Task t = newBlob.UploadTextAsync(builder.ToString(), null, options, null);
                        t.Wait();
                    } while (rdr.NextResult());
                }


            }

        }
        private string returnWithQuotes(object s)
        {
            string val = s.ToString().Trim();
            if (val.Contains(","))
            {
                return "\"" + val + "\"";
            }
            return val;
        }
    }
}
