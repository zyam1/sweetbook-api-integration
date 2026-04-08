module.exports = {
  ANTHOLOGY_BOOK_SPEC_UID: 'SQUAREBOOK_HC',
  ANTHOLOGY_CONTENT_TEMPLATE_UID: '79LHkH32MLH1',
  ANTHOLOGY_COVER_TEMPLATE_UID: '79yjMH3qRPly',
  formatDateRange(date) {
    const d = date instanceof Date ? date : new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}.${m}`;
  },
};
