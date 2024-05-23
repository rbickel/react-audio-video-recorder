using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace api
{
    public static class recording
    {

        private static string GetEnvironmentVariable(string name)
        {
            return Environment.GetEnvironmentVariable(name, EnvironmentVariableTarget.Process);
        }

        private static string GetConnectionString()
        {
            return GetEnvironmentVariable("STORAGE_CONNECTION_STRING");
        }

        private static string GetContainerName()
        {
            return GetEnvironmentVariable("CONTAINER_NAME");
        }

        [FunctionName("recording")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "put", Route = "recording/{id}")] HttpRequest req,
            string id,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            // Get the file bytes from the request body
            byte[] fileBytes;
            using (var memoryStream = new MemoryStream())
            {
                await req.Body.CopyToAsync(memoryStream);
                fileBytes = memoryStream.ToArray();
            }

            // Get the content type from the request header
            string contentType = req.ContentType;

            // Upload the file to Azure Storage account
            string storageConnectionString = GetConnectionString();
            string containerName = GetContainerName();

            // TODO: Implement the code to upload the file to Azure Storage account using the fileBytes, contentType, storageConnectionString, and containerName variables

            // Example code to upload the file using Azure.Storage.Blobs package
            

            // ...

            // FILEPATH: /C:/Projects/react-audio-video-recorder/api/recording.cs
            using (var stream = new MemoryStream(fileBytes))
            {
                var blobServiceClient = new BlobServiceClient(storageConnectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                var blobClient = containerClient.GetBlobClient(id+Path.GetExtension(contentType));
                await blobClient.UploadAsync(stream, new BlobUploadOptions { HttpHeaders = new BlobHttpHeaders { ContentType = contentType } });
            }

            // TODO: Set the response message accordingly
            string responseMessage = "File uploaded successfully";

            return new OkObjectResult(responseMessage);
        }
    }
}
