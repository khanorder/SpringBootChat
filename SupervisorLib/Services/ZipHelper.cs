using System;
using System.IO;
using System.IO.Compression;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Supervisor.Client.Services
{
    public class ZipHelper
    {
        private ILogger<ZipHelper> _logger;

        public ZipHelper(ILogger<ZipHelper> logger)
        {
            _logger = logger;
        }

        public void CreateFromFile(
            string sourceFilePath,
            string destinationArchiveFileName,
            CompressionLevel compressionLevel
        )
        {
            if (string.IsNullOrEmpty(sourceFilePath))
                throw new ArgumentNullException("sourceFileName");

            if (string.IsNullOrEmpty(destinationArchiveFileName))
                throw new ArgumentNullException("destinationArchiveFileName");

            if (false == File.Exists(sourceFilePath))
                throw new ArgumentException("notFoundSourceFile");

            var fileInfo = new FileInfo(sourceFilePath);

            using (var zipFileStream = new FileStream(destinationArchiveFileName, FileMode.Create))
            {
                using (var archive = new ZipArchive(zipFileStream, ZipArchiveMode.Create))
                {
                    archive.CreateEntryFromFile(sourceFilePath, fileInfo.Name, compressionLevel);
                }
            }
        }

        public void CreateFromDirectory(
            string sourceDirectoryName, 
            string destinationArchiveFileName, 
            CompressionLevel compressionLevel, 
            bool includeBaseDirectory, 
            Predicate<string> filter // Add this parameter
        )
        {
            if (string.IsNullOrEmpty(sourceDirectoryName))
                throw new ArgumentNullException("sourceDirectoryName");

            if (string.IsNullOrEmpty(destinationArchiveFileName))
                throw new ArgumentNullException("destinationArchiveFileName");

            var filesToAdd = Directory.GetFiles(sourceDirectoryName, "*", SearchOption.AllDirectories);
            var entryNames = GetEntryNames(filesToAdd, sourceDirectoryName, includeBaseDirectory);
            using (var zipFileStream = new FileStream(destinationArchiveFileName, FileMode.Create))
            {
                using (var archive = new ZipArchive(zipFileStream, ZipArchiveMode.Create))
                {
                    for (int i = 0; i < filesToAdd.Length; i++)
                    {
                        // Add the following condition to do filtering:
                        if (false == filter(filesToAdd[i]))
                            continue;

                        archive.CreateEntryFromFile(@$"{filesToAdd[i]}", entryNames[i], compressionLevel);
                    }
                }
            }
        }

        public void CreateFromDirectoryOnly(
            string sourceDirectoryName,
            string destinationArchiveFileName,
            CompressionLevel compressionLevel,
            bool includeBaseDirectory,
            Predicate<string> filter // Add this parameter
        )
        {
            if (string.IsNullOrEmpty(sourceDirectoryName))
                throw new ArgumentNullException("sourceDirectoryName");

            if (string.IsNullOrEmpty(destinationArchiveFileName))
                throw new ArgumentNullException("destinationArchiveFileName");

            var filesToAdd = Directory.GetFiles(sourceDirectoryName, "*", SearchOption.AllDirectories);
            var entryNames = GetEntryNames(filesToAdd, sourceDirectoryName, includeBaseDirectory);
            using (var zipFileStream = new FileStream(destinationArchiveFileName, FileMode.Create))
            {
                using (var archive = new ZipArchive(zipFileStream, ZipArchiveMode.Create))
                {
                    for (int i = 0; i < filesToAdd.Length; i++)
                    {
                        // Add the following condition to do filtering:
                        if (filter(filesToAdd[i]))
                            archive.CreateEntryFromFile(@$"{filesToAdd[i]}", entryNames[i], compressionLevel);
                    }
                }
            }
        }

        public void CreateFromDirectoryOnly(
            string sourceDirectoryName,
            string destinationArchiveFileName,
            CompressionLevel compressionLevel,
            bool includeBaseDirectory,
            Predicate<string> filter, // Add this parameter
            FileMode createZipFileMode,
            ZipArchiveMode zipArchiveMode
        )
        {
            if (string.IsNullOrEmpty(sourceDirectoryName))
                throw new ArgumentNullException("sourceDirectoryName");

            if (string.IsNullOrEmpty(destinationArchiveFileName))
                throw new ArgumentNullException("destinationArchiveFileName");

            var filesToAdd = Directory.GetFiles(sourceDirectoryName, "*", SearchOption.AllDirectories);
            var entryNames = GetEntryNames(filesToAdd, sourceDirectoryName, includeBaseDirectory);
            using (var zipFileStream = new FileStream(destinationArchiveFileName, createZipFileMode))
            {
                using (var archive = new ZipArchive(zipFileStream, zipArchiveMode))
                {
                    for (int i = 0; i < filesToAdd.Length; i++)
                    {
                        // Add the following condition to do filtering:
                        if (filter(filesToAdd[i]))
                            archive.CreateEntryFromFile(@$"{filesToAdd[i]}", entryNames[i], compressionLevel);
                    }
                }
            }
        }

        private string[] GetEntryNames(string[] names, string sourceFolder, bool includeBaseName)
        {
            if (names == null || names.Length == 0)
                return new string[0];

            if (includeBaseName)
                sourceFolder = Path.GetDirectoryName(sourceFolder);

            int length = string.IsNullOrEmpty(sourceFolder) ? 0 : sourceFolder.Length;
            if (length > 0 && sourceFolder != null && sourceFolder[length - 1] != Path.DirectorySeparatorChar && sourceFolder[length - 1] != Path.AltDirectorySeparatorChar)
                length++;

            var result = new string[names.Length];
            for (int i = 0; i < names.Length; i++)
                result[i] = names[i].Substring(length);

            return result;
        }
    }
}
