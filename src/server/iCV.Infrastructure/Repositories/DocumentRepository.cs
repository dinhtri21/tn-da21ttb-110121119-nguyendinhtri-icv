using iCV.Application.Common.Interfaces;
using iCV.Infrastructure.Context;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using iCV.Domain.Entities;

namespace iCV.Infrastructure.Repositories
{
    public class DocumentRepository : IDocumentRepository
    {
        private readonly IMongoCollection<Document> _documents;

        public DocumentRepository(MongoDbContext context)
        {
            _documents = context.Documents;
        }

        public async Task CreateDocumentAsync(Document document)
        {
            await _documents.InsertOneAsync(document);
        }

        public async Task<Document?> GetDocumentByIdAsync(string id)
        {
            return await _documents.Find(d => d.id == id).FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Document>> GetAllDocumentsAsync()
        {
            return await _documents.Find(_ => true).ToListAsync();
        }

        public async Task UpdateDocumentAsync(Document document)
        {
            await _documents.ReplaceOneAsync(d => d.id == document.id, document);
        }

        public async Task DeleteDocumentAsync(string id)
        {
            await _documents.DeleteOneAsync(d => d.id == id);
        }
    }
}
