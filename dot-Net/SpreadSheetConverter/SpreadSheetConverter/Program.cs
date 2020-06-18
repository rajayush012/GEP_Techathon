using ExcelDataReader;
using System;
using System.IO;
using System.Linq;
using System.Threading;
using System.Data;
using System.Text;
using System.Collections.Generic;


namespace SpreadSheetConverter
{
    class Program
    {
        private string[] excelFormats = { ".xls", ".xlsm", ".xlsx" };
        static void Main(string[] args)
        {
            System.Text.Encoding.RegisterProvider(System.Text.CodePagesEncodingProvider.Instance);
            Program p = new Program();
            p.ConvertUsingAspose("C:\\Users\\vbspk\\Desktop\\temp.xlsx");
            Console.WriteLine("successfull");
            
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
                File.Move(path, newPath);
            }
        }

        private void ExcelToCsv(string path)
        {
            FileStream fs = File.Open(path, FileMode.Open, FileAccess.Read);
            StringBuilder builder = new StringBuilder();
            using (var rdr = ExcelReaderFactory.CreateOpenXmlReader(fs))
            {
                while (rdr.Read()) 
                {
                    for (int i = 0; i < rdr.FieldCount; i++) {
                        builder.Append(returnWithQuotes(rdr.GetValue(i).ToString()) + ",");
                    }
                    builder.Remove(builder.Length - 1, 1);
                    builder.AppendLine();
                }
            }
            fs.Close();
            string newPath = string.Join(".",path.Split(".").SkipLast(1).Append("csv"));
            using (StreamWriter writer = new StreamWriter(newPath, false, Encoding.UTF8)) {
                writer.Write(builder);
            }
        }

        private string returnWithQuotes(object s)
        {
            string val = s.ToString().Trim();
            if (val.Contains(",")) {
                return "\"" + val + "\"";
            }
            return val;
        }

        public void ConvertUsingAspose(string path)
        {
            Aspose.Cells.Workbook book = new Aspose.Cells.Workbook(path);
            string newPath = string.Join(".", path.Split(".").SkipLast(1).Append("csv"));
            book.Save(newPath, Aspose.Cells.SaveFormat.CSV);
        }
    }
}
