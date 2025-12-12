---
trigger: always_on
---

1. Bất cứ khi nào tạo các component mà có thể bị giới hạn chiều dài, phải thêm ScrollArea component.
2. Bất cứ khi nào tạo các component có thể bị giới hạn chiều rộng, tùy vào tình huống sẽ phải thêm ScrollArea component, trong các trường hợp không cần thiết phải show full width của component con của component đó, thì phải set cho component con trong đó có width flexible, có nghĩa tùy tình huống có thể sẽ thêm w-full hoặc những class khác giúp flexible width.
3. Bất cứ khi nào tạo thành phần hiển thị text, luôn tạo thành phần có max-w-full hoặc w-full nếu được, ngoài ra thì cho text nếu dài hơn width của thành phần thì sẽ xuống dòng nếu có thể, trường hợp hiển thị trên 1 dòng thì sẽ cho dấu ..., và khi hover vào thì sẽ hiển thị title có cùng nội dung text.
4. luôn luôn set height cho ScrollArea cuộn dọc, và luôn luôn set width cho ScrollArea cuộn ngang.
5. đối với các base component, hãy kiểm tra trong thư mục @components/ui trước tiên, nếu không có thì hãy kiểm tra các component ở https://ui.shadcn.com/docs/components, implement component này về dự án và kế thừa các base component này cho các component của các chức năng.
