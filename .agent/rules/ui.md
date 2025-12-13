---
trigger: always_on
---

- Bất cứ khi nào tạo các component mà có thể bị giới hạn chiều dài, phải thêm ScrollArea component.
- Bất cứ khi nào tạo các component có thể bị giới hạn chiều rộng, tùy vào tình huống sẽ phải thêm ScrollArea component, trong các trường hợp không cần thiết phải show full width của component con của component đó, thì phải set cho component con trong đó có width flexible, có nghĩa tùy tình huống có thể sẽ thêm w-full hoặc những class khác giúp flexible width.
- Bất cứ khi nào tạo thành phần hiển thị text, luôn tạo thành phần có max-w-full hoặc w-full nếu được, ngoài ra thì cho text nếu dài hơn width của thành phần thì sẽ xuống dòng nếu có thể, trường hợp hiển thị trên 1 dòng thì sẽ cho dấu ..., và khi hover vào thì sẽ hiển thị title có cùng nội dung text.
- luôn luôn set height cho ScrollArea cuộn dọc, và luôn luôn set width cho ScrollArea cuộn ngang.
- đối với các base component, hãy kiểm tra trong thư mục @components/ui trước tiên, nếu không có thì hãy kiểm tra các component ở https://ui.shadcn.com/docs/components, implement component này về dự án và kế thừa các base component này cho các component của các chức năng.
- Khi gặp các component có các state được dùng chung cho nhiều components con, thì hãy tạo slice redux để quản lý các state đó.
- Đối với mỗi feature component, nó sẽ là 1 page, vì thế, hãy tạo các thư mục utils, constant, hooks, types, ... nếu cần. Mục đích sẽ tạo những thứ chỉ dùng cho 1 trang đó, còn nếu dùng cho nhiều hơn 1 trang, thì phải tạo ở src/utils, src/constant, src/hooks, src/types, ..., Ngoài ra, khi vào các component của 1 feature/component, sẽ có những component lớn, ví dụ như StudioPannel, nếu cần thiết, hãy tạo các thư mục utils, constant, hooks, types, ... nếu cần, và cũng như treen, mục đích tạo những thứ chỉ dùng cho các component con của component lớn đó.
- Đối với các label, text, ... luôn luôn cho text sử dụng ngôn ngữ tiếng anh 'en'.