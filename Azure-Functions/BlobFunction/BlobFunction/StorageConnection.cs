using System;
using System.Collections.Generic;
using System.Text;
using GEP.Techathon.API;
using Microsoft.Extensions.Options;
using Microsoft.WindowsAzure.Storage;

namespace BlobFunction
{
    class StorageConnection
    {
        public MyConfig config { get; set; }

        public CloudStorageAccount storageAccount;
        public void Connect() {
            storageAccount = CloudStorageAccount.Parse(config.StorageConnection);
        }

        
    }
}
