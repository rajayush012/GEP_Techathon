using System;
using System.Collections.Generic;
using System.Text;
using ExcelDataReader;
using System.IO;
using System.Linq;
using GEP.Techathon.API;
using Microsoft.WindowsAzure.Storage.Blob;
using BlobFunction.Extensions;
using Microsoft.Build.Utilities;
using System.Threading.Tasks;

namespace BlobFunction
{
    class Converter
    {
        private string[] excelFormats = { ".xls", ".xlsm", ".xlsx" };
        public StorageConnection conn;

        public Converter() {
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
            this.conn = new StorageConnection();
            string connectionString = "DefaultEndpointsProtocol=https;AccountName=storageaccountgepte86f5;AccountKey=tWMNBa2qlEgVEt6cOnmDbYdsJ0igQmnmJzcJx2d5lxuf0y1iYyMEbkM9n8KlUfPvlSF9Mtc3KE5CrhAWy/fpAg==;EndpointSuffix=core.windows.net";
            conn.config = new MyConfig() { StorageConnection = connectionString, Container = "techathoninput" };
            conn.Connect();
        }

        


        public async void  ConvertUsingExcelLibrary(string path)
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
                await container.CreateIfNotExistsAsync();
                //CloudBlockBlob blob;

                CloudBlockBlob blob = container.GetBlockBlobReference(path);
                CloudBlockBlob newBlob = container.GetBlockBlobReference(newPath);
                blob.Properties.ContentType = "application/json";
                newBlob.Properties.ContentType = "application/json";
                Stream myBlob = await blob.OpenReadAsync();
                var dataBytes = StreamExtensions.ReadToEnd(myBlob);
                using (Stream stream = new MemoryStream(dataBytes,0, dataBytes.Length))
                {

                    await newBlob.UploadFromStreamAsync(stream).ConfigureAwait(false);

                }

                //blob = container.GetBlockBlobReference(path);
                //blob.Properties.ContentType = "application/json";
                //await blob.UploadFromStreamAsync(myBlob);
            }
        }



        private async void ExcelToCsv(string path)
        {
            //FileStream fs = File.Open(path, FileMode.Open, FileAccess.Read);
            StringBuilder builder = new StringBuilder();
            CloudBlobClient client = conn.storageAccount.CreateCloudBlobClient();
            CloudBlobContainer container = client.GetContainerReference(conn.config.Container);
            await container.CreateIfNotExistsAsync();
            CloudBlockBlob blob;
            blob = container.GetBlockBlobReference(path);
            blob.Properties.ContentType = "application/json";
            //Stream myBlob = await blob.OpenReadAsync();
            using (var blobStream = await blob.OpenReadAsync())
            {
                if (Path.GetExtension(path) == ".xls")
                {
                    using (var rdr = ExcelReaderFactory.CreateBinaryReader(blobStream))
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
                    }

                }
                else {
                    using (var rdr = ExcelReaderFactory.CreateOpenXmlReader(blobStream))
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
                    }

                }
            }

           
            //fs.Close();
            string newPath = string.Join(".", path.Split(".").SkipLast(1).Append("csv"));
            CloudBlockBlob newBlob;
            newBlob = container.GetBlockBlobReference(newPath);
            newBlob.Properties.ContentType = "application/json";
            await newBlob.UploadTextAsync(builder.ToString());
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
