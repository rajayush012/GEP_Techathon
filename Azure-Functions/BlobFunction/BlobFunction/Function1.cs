using System;
using System.IO;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;

namespace BlobFunction
{
    public static class Function1
    {
        [FunctionName("ReadExcel")]
        public static void Run([BlobTrigger("techathoninput/{name}", Connection = "")]Stream myBlob, string name, ILogger log, ExecutionContext executionContext)
        {

                Converter converter = new Converter();
                converter.ConvertUsingExcelLibrary(myBlob, name);


            // Once converted push to same location techathoninput 

            log.LogInformation($"C# Blob trigger function Processed blob\n Name:{name} \n Size: {myBlob.Length} Bytes");
        }
    }
}
