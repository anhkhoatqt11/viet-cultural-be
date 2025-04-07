const isQuestionRelated = (prompt) => {
    const keywords = [
        'lịch sử', 'văn hóa', 'triều đại', 'nhà', 'vua', 'hoàng', 'khởi nghĩa', 'chiến tranh',
        'truyền thống', 'lễ hội', 'phong tục', 'di sản', 'đền', 'chùa', 'kiến trúc', 'nghệ thuật',
        'sự kiện', 'nhân vật', 'thời kỳ', 'thế kỷ', 'nền văn minh', 'tôn giáo', 'phong kiến',
        'history', 'culture', 'dynasty', 'king', 'emperor', 'rebellion', 'war', 'tradition',
        'festival', 'custom', 'heritage', 'temple', 'architecture', 'art', 'event', 'figure',
        'era', 'century', 'civilization', 'religion', 'feudal'
    ];

  const lowerPrompt = prompt.toLowerCase();

  return keywords.some(keyword => lowerPrompt.includes(keyword));
}

module.exports = {
  isQuestionRelated
}