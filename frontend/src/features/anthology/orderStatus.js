// 합본 주문 상태 → 한글 라벨 매핑
export function orderStatusLabel(status) {
  switch (status) {
    case 'PAID':
    case 'PDF_READY':
      return '결제완료';
    case 'CONFIRMED':
    case 'IN_PRODUCTION':
    case 'COMPLETED':
    case 'PRODUCTION_COMPLETE':
      return '제작중';
    case 'SHIPPED':
      return '배송중';
    case 'DELIVERED':
      return '배송완료';
    case 'CANCELLED':
    case 'CANCELLED_REFUND':
      return '취소';
    default:
      return status || '';
  }
}

// 주문 상태 → 뱃지 색상 클래스 매핑
export function orderBadgeClass(status) {
  switch (status) {
    case 'PAID':
    case 'PDF_READY':
      return 'yellow';
    case 'CONFIRMED':
    case 'IN_PRODUCTION':
    case 'COMPLETED':
    case 'PRODUCTION_COMPLETE':
      return 'lavender';
    case 'SHIPPED':
      return 'pink';
    case 'DELIVERED':
      return 'lavender';
    case 'CANCELLED':
    case 'CANCELLED_REFUND':
      return 'subtle';
    default:
      return 'subtle';
  }
}
