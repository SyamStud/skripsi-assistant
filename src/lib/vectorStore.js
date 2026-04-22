import { embedText } from './embeddings';
import { supabaseAdmin } from './supabase';

export async function upsertChunks(indexName, documentId, chunks) {

    const vectorIds = [];

    for (const chunk of chunks) {
        const embedding = await embedText(chunk.text);
        const vectorId = `${documentId}_${chunk.chunkIndex}`;

        const { error } = await supabaseAdmin
            .from('documents_chunks')
            .upsert({
                id: vectorId,
                document_id: documentId.toString(),
                text: chunk.text,
                page_number: chunk.pageNumber,
                chunk_index: chunk.chunkIndex,
                embedding: embedding,
            }, { onConflict: 'id' });

        if (error) {
            console.error('Error inserting chunk into Supabase:', error);
            throw new Error(`Gagal menyimpan chunk: ${error.message}`);
        }

        vectorIds.push(vectorId);
    }

    return vectorIds;
}

export async function searchSimilar(indexName, query, documentIds = [], topK = 5) {
    const queryEmbedding = await embedText(query);

    const { data, error } = await supabaseAdmin.rpc('match_document_chunks_v2', {
        query_embedding: queryEmbedding,
        match_count: topK,
        filter_document_ids: documentIds.length > 0 ? documentIds.map(String) : null,
    });

    if (error) {
        console.error('Error searching chunks in Supabase:', error);
        throw new Error(`Pencarian gagal: ${error.message}`);
    }

    return (data || []).map((match) => ({
        text: match.text || '',
        pageNumber: match.page_number || 0,
        score: match.similarity || 0,
    }));
}