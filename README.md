# Lab_04

## M1 — HTTP-сервер

Реалізовано HTTP-сервер на Node.js з використанням `node:http`.

Реалізовано:

* роздачу production-файлів клієнта;
* `GET /api/rooms`;
* `POST /api/rooms`;
* `GET /health`;
* захист від path traversal;
* обмеження розміру тіла POST-запиту;
* конфігурацію через змінні середовища;
* graceful shutdown при `SIGINT` та `SIGTERM`;
* proxy для `/api` та `/ws` у Vite.

## M2 — Кімнати та життєвий цикл WebSocket

Реалізовано кімнати та WebSocket-взаємодію між клієнтами.

<img width="1454" height="734" alt="Снимок экрана 2026-09-23 в 18 28 01" src="https://github.com/user-attachments/assets/de42cf59-8839-453b-8ab5-f95365e7769e" />


## M3 — Match logs as streams
Реалізовано потокове журналювання подій кімнат у форматі NDJSON, replay-файли та потокове передавання файлів клієнту без буферизації.
Для перевірки backpressure створено синтетичний лог розміром 200 MB та виконано його завантаження через обмежене з'єднання.

<img width="689" height="416" alt="Снимок экрана 2026-09-23 в 16 24 52" src="https://github.com/user-attachments/assets/5d410717-14d5-48bd-b2c1-4a1575d1021e" />





