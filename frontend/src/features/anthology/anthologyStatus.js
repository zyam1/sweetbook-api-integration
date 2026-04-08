// 합동지(anthology) 상태 → 한글 라벨 매핑
export function anthologyStatusLabel(status) {
  switch (status) {
    case 'RECRUITING':
      return '진행중';
    case 'DRAFT':
      return '초안';
    case 'FINALIZED':
      return '마감(배송전)';
    default:
      return status || '';
  }
}

// 합동지 상태 → 뱃지 색상 클래스 매핑
export function anthologyBadgeClass(status) {
  switch (status) {
    case 'RECRUITING':
      return 'pink';
    case 'DRAFT':
      return 'subtle';
    case 'FINALIZED':
      return 'lavender';
    default:
      return 'subtle';
  }
}
