using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using GEP.Techathon.API;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;

namespace BlobFunction
{
    class StorageConnection
    {
        public MyConfig config { get; set; }

        public CloudStorageAccount storageAccount;
        public void Connect() {
            storageAccount = CloudStorageAccount.Parse(config.StorageConnection);
        }
        public async Task<List<string>> GetListOfFiles() {
            List<string> blobs = new List<string>();
            
               
                    CloudBlobClient blobClient = storageAccount.CreateCloudBlobClient();

                    CloudBlobContainer container = blobClient.GetContainerReference(config.Container);

                    BlobResultSegment resultSegment = await container.ListBlobsSegmentedAsync(null);
                    foreach (IListBlobItem item in resultSegment.Results)
                    {
                        if (item.GetType() == typeof(CloudBlockBlob))
                        {
                            CloudBlockBlob blob = (CloudBlockBlob)item;
                            blobs.Add(blob.Name);
                        }
                        else if (item.GetType() == typeof(CloudPageBlob))
                        {
                            CloudPageBlob blob = (CloudPageBlob)item;
                            blobs.Add(blob.Name);
                        }
                        else if (item.GetType() == typeof(CloudBlobDirectory))
                        {
                            CloudBlobDirectory dir = (CloudBlobDirectory)item;
                            blobs.Add(dir.Uri.ToString());
                        }
                    }
                
            
            return blobs;
        }
        
    }
}
