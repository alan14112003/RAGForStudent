/**
 * Lấy chữ cái đầu của tên để hiển thị avatar fallback
 * @param name - Tên đầy đủ
 * @returns Chữ cái đầu (1-2 ký tự)
 */
export function getInitials(name: string | undefined): string {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
}
