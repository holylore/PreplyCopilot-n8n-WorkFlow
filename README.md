# **PreplyCopilot**

Log lessons and new students from a Telegram message. Logging takes seconds instead of minutes, so busy tutors stay consistent under pressure.

## **Why I built it**

My girlfriend started teaching **Mandarin** online using **Preply**. As often happens when starting a side business, the start was rough. The most annoying problem was keeping **consistency** while logging classes and new students, which is time consuming and sometimes there isn't time at all.

She teaches **back-to-back online lessons** with only **5 to 10 minutes** between them. That's not enough time to open **Notion**, find the right field, and fill it in, so lesson notes were either delayed or skipped.

So I built her a **workflow** she can use from her phone. She sends a **Telegram message**, and the workflow writes the lesson to the right student's page. Logging dropped from about **3 minutes** to about **10 seconds** per lesson (tutor's estimate).

When preparing material for her students, she opens **Notion**, checks all previous classes and topics covered, and prepares effectively.

**Time saved** ≈ (**new students** × 3 min) + (**lessons logged** × 3 min)

## **What it does**

The workflow works using **two distinct commands**:

- `add: Name, Level, $Price, N classes` creates a **new student page**.
- `log: Name, lesson notes` adds a **lesson** linked to that student.

**Levels:** Beginner, Intermediate, Advanced, Intermediate-Advanced, Kid, or A1 to C2. Always include the **`$` sign** on prices, since a bare number is read as **classes per month**.

**Voice notes** work too. A voice note is transcribed with **Gemini** or directly sent to the **Classifier** if it is text, then parsed like any other message.

## **How it works**

1. A **Telegram Trigger** receives a text or voice message.
2. A voice note is transcribed with **Gemini**, or text goes directly to the **Classifier**.
3. A **Classifier** (JavaScript) checks the sender against an **allowed list**, parses the command, and validates the input. Invalid input never reaches **Notion**.
4. A **Switch** routes the message to "add student" or "log lesson".
5. For lessons, the **Students database** is queried and the student is matched by **exact name**.
6. The result is written to **Notion**: a new student page for `add`, or a lesson page linked to the student's page for `log`.
7. A **confirmation or error** goes back to Telegram.

<img width="1418" height="373" alt="image" src="https://github.com/user-attachments/assets/4a6c8855-ae1f-4818-ae81-8e73503ae2fd" />

## **Tech stack and why**

- **n8n** (self-hosted, Docker): visual workflows that are easy to inspect and debug. Self-hosting means **no per-execution fees**, and the logic stays readable for anyone who maintains it.
- **ngrok**: exposes the local n8n instance so Telegram can send **webhooks** to it.
- **Telegram Bot API**: the fastest input a busy tutor has. It works from a phone in seconds, with **no app to install** and no form to load.
- **Gemini**: transcribes voice notes. Chosen because it accepts **audio directly** and has a **free tier**.
- **Notion API**: the database the tutor already uses for her CRM. **Students** and **Lessons** are two **linked databases**, so each student page shows every lesson.

**JavaScript (Classifier)** is the parsing and validation step, kept as code rather than an **LLM call**. A command grammar must be **predictable**: the same message should always produce the same result, and a failed parse should be caught, not guessed at.

**Disclaimer:** I wrote the workflow design and requirements. The code was written with **AI assistance**, and I reviewed, tested, and corrected it against real use.

## **Design decisions**

- **Validation before writing.** Anything that doesn't parse, or comes from an unknown chat, is rejected before **Notion** is touched.
- **Exact name matching.** Fuzzy matching would write a lesson to the wrong student. Exact matching fails loudly instead.
- **Access control.** The Classifier accepts messages only from a list of **allowed chat IDs**, so the bot can't write to Notion for anyone else.
- **Retries on Notion nodes.** **Transient API errors** are retried automatically.

## **Limitations**

- Students are matched by **exact name**, so a transcription error (for example, a wrong character or romanization) produces a "not found" reply rather than a wrong write. Plain text input gives the tutor full control over the name. Better transcription, such as a **paid speech-to-text tier**, would reduce these errors.
- Two students with the same name would resolve to the **first match**.
- Transcription quality depends on **audio quality** and **mixed-language speech**.
- If the **ngrok URL** changes, Telegram stops delivering messages until the webhook is updated.
- Notion API errors are retried, but a write that still fails after retries sends **no confirmation**.

## **Links**

- **LinkedIn**: https://linkedin.com/in/lorenzopardini
- **Kaggle**: https://www.kaggle.com/lorenzopardini
- **Lovable portfolio**: https://lorenzopardini.lovable.app

---
