using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using iCV.Domain.Entities;

namespace iCV.Application.Common.Interfaces
{
    public interface IDocumentRepository
    {
        Task CreateDocumentAsync(Document document);
        Task<Document?> GetDocumentByIdAsync(string id);
        Task<IEnumerable<Document>> GetAllDocumentsAsync();
        Task UpdateDocumentAsync(Document document);
        Task DeleteDocumentAsync(string id);
    }
}
