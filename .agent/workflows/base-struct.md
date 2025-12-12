---
description: template cấu trúc thư mục của dự án
---

Directory structure:
└── alan14112003-ragforstudent/
    ├── docker-compose.yml
    ├── backend/
    │   ├── main.py
    │   ├── requirements.txt
    │   └── app/
    │       ├── __init__.py
    │       ├── main.py
    │       ├── api/
    │       │   ├── api.py
    │       │   ├── deps.py
    │       │   └── endpoints/
    │       │       ├── auth.py
    │       │       ├── chats.py
    │       │       └── users.py
    │       ├── core/
    │       │   ├── config.py
    │       │   └── database.py
    │       ├── models/
    │       │   ├── __init__.py
    │       │   ├── chat.py
    │       │   ├── document.py
    │       │   └── user.py
    │       ├── schemas/
    │       │   ├── __init__.py
    │       │   ├── chat.py
    │       │   ├── document.py
    │       │   ├── token.py
    │       │   └── user.py
    │       └── services/
    │           ├── __init__.py
    │           ├── auth.py
    │           ├── exceptions.py
    │           ├── llm.py
    │           ├── storage.py
    │           └── rag/
    │               ├── __init__.py
    │               ├── service.py
    │               ├── converter/
    │               │   ├── __init__.py
    │               │   ├── api_converter.py
    │               │   ├── base.py
    │               │   ├── converter_factory.py
    │               │   ├── file_converter.py
    │               │   ├── web_converter.py
    │               │   └── loaders/
    │               │       ├── base_loader.py
    │               │       ├── csv_loader.py
    │               │       ├── pdf_loader.py
    │               │       ├── text_loader.py
    │               │       └── word_loader.py
    │               └── qdrant_storage/
    │                   └── qdrant_storage.py
    ├── dockerfiles/
    │   ├── ollama/
    │   │   ├── Dockerfile
    │   │   └── start.sh
    │   └── python/
    │       └── Dockerfile
    └── frontend/
        ├── README.md
        ├── components.json
        ├── eslint.config.mjs
        ├── next.config.ts
        ├── package.json
        ├── postcss.config.mjs
        ├── tsconfig.json
        └── src/
            ├── app/
            │   ├── globals.css
            │   ├── layout.tsx
            │   ├── (auth)/
            │   │   └── login/
            │   │       └── page.tsx
            │   ├── (dashboard)/
            │   │   ├── layout.tsx
            │   │   ├── page.tsx
            │   │   └── profile/
            │   │       └── page.tsx
            │   └── (notebook)/
            │       ├── layout.tsx
            │       └── notebook/
            │           └── [id]/
            │               └── page.tsx
            ├── components/
            │   ├── providers.tsx
            │   ├── auth/
            │   │   └── require-auth.tsx
            │   ├── common/
            │   │   └── file-upload.tsx
            │   ├── features/
            │   │   ├── sidebar.tsx
            │   │   ├── Dashboard/
            │   │   │   ├── Dashboard.tsx
            │   │   │   ├── index.ts
            │   │   │   └── components/
            │   │   │       ├── CreateNotebookCard/
            │   │   │       │   ├── CreateNotebookCard.tsx
            │   │   │       │   └── index.ts
            │   │   │       └── NotebookItem/
            │   │   │           ├── index.ts
            │   │   │           ├── NotebookItem.tsx
            │   │   │           └── components/
            │   │   │               └── NotebookMenu/
            │   │   │                   ├── index.ts
            │   │   │                   └── NotebookMenu.tsx
            │   │   ├── Header/
            │   │   │   ├── Header.tsx
            │   │   │   ├── index.ts
            │   │   │   └── components/
            │   │   │       ├── EditableTitle/
            │   │   │       │   ├── EditableTitle.tsx
            │   │   │       │   └── index.ts
            │   │   │       ├── SettingsMenu/
            │   │   │       │   ├── index.ts
            │   │   │       │   └── SettingsMenu.tsx
            │   │   │       └── UserMenu/
            │   │   │           ├── index.ts
            │   │   │           └── UserMenu.tsx
            │   │   ├── NotebookPage/
            │   │   │   ├── index.ts
            │   │   │   ├── NotebookPage.tsx
            │   │   │   └── components/
            │   │   │       ├── ChatPanel/
            │   │   │       │   ├── ChatPanel.tsx
            │   │   │       │   ├── index.ts
            │   │   │       │   └── components/
            │   │   │       │       ├── ChatInput/
            │   │   │       │       │   ├── ChatInput.tsx
            │   │   │       │       │   └── index.ts
            │   │   │       │       ├── MessageList/
            │   │   │       │       │   ├── index.ts
            │   │   │       │       │   ├── MessageList.tsx
            │   │   │       │       │   └── components/
            │   │   │       │       │       └── MessageItem/
            │   │   │       │       │           ├── index.ts
            │   │   │       │       │           └── MessageItem.tsx
            │   │   │       │       └── ScrollToBottom/
            │   │   │       │           ├── index.ts
            │   │   │       │           └── ScrollToBottom.tsx
            │   │   │       ├── MobileTabNav/
            │   │   │       │   ├── index.ts
            │   │   │       │   └── MobileTabNav.tsx
            │   │   │       ├── SourcesPanel/
            │   │   │       │   ├── index.ts
            │   │   │       │   ├── SourcesPanel.tsx
            │   │   │       │   └── components/
            │   │   │       │       ├── AddSourceModal/
            │   │   │       │       │   ├── AddSourceModal.tsx
            │   │   │       │       │   └── index.ts
            │   │   │       │       └── SourceItem/
            │   │   │       │           ├── index.ts
            │   │   │       │           └── SourceItem.tsx
            │   │   │       └── StudioPanel/
            │   │   │           ├── index.ts
            │   │   │           ├── StudioPanel.tsx
            │   │   │           └── components/
            │   │   │               └── SourceDetail/
            │   │   │                   ├── index.ts
            │   │   │                   └── SourceDetail.tsx
            │   │   └── ProfilePage/
            │   │       ├── index.ts
            │   │       ├── ProfilePage.tsx
            │   │       └── components/
            │   │           ├── AccountSettings/
            │   │           │   ├── AccountSettings.tsx
            │   │           │   └── index.ts
            │   │           ├── ChangePasswordDialog/
            │   │           │   ├── ChangePasswordDialog.tsx
            │   │           │   └── index.ts
            │   │           ├── DangerZone/
            │   │           │   ├── DangerZone.tsx
            │   │           │   └── index.ts
            │   │           ├── HeroSection/
            │   │           │   ├── HeroSection.tsx
            │   │           │   └── index.ts
            │   │           └── StatsCards/
            │   │               ├── index.ts
            │   │               └── StatsCards.tsx
            │   └── ui/
            │       ├── avatar.tsx
            │       ├── badge.tsx
            │       ├── button.tsx
            │       ├── card.tsx
            │       ├── dialog.tsx
            │       ├── dropdown-menu.tsx
            │       ├── input.tsx
            │       ├── resizable.tsx
            │       ├── scroll-area.tsx
            │       ├── sheet.tsx
            │       └── textarea.tsx
            ├── hooks/
            │   ├── index.ts
            │   └── useIsMobile.ts
            ├── lib/
            │   ├── axios.ts
            │   ├── helpers.ts
            │   ├── queryKeys.ts
            │   ├── react-query.ts
            │   └── utils.ts
            ├── services/
            │   ├── api.ts
            │   ├── authService.ts
            │   └── chatService.ts
            ├── store/
            │   ├── index.ts
            │   └── features/
            │       ├── authSlice.ts
            │       └── uiSlice.ts
            └── types/
                ├── auth.types.ts
                ├── chat.types.ts
                ├── index.ts
                ├── message.types.ts
                ├── notebook.types.ts
                ├── store.types.ts
                └── user.types.ts
