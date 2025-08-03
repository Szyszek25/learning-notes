# Przewodnik Konfiguracji - Learning Notes

Ten przewodnik wyjaśnia **krok po kroku, jak skonfigurować** system synchronizacji notatek z Notion do GitHub.

## ⚡ Szybka Konfiguracja (5 minut)

1. **Notion**: Utwórz integrację → Skopiuj token → Udostępnij bazę danych
2. **GitHub**: Dodaj sekretne zmienne (`NOTION_TOKEN`, `NOTION_DATABASE_ID`)
3. **Test**: Uruchom workflow w GitHub Actions
4. **Gotowe!** Twoje notatki będą synchronizowane codziennie

*Szczegółowe instrukcje znajdziesz poniżej ⬇️*

---

## Przegląd Systemu

System składa się z trzech głównych części:
1. **Automatyczna synchronizacja** - codziennie o 8:00 UTC
2. **Webhook (opcjonalnie)** - synchronizacja w czasie rzeczywistym
3. **Ręczne uruchamianie** - przez GitHub Actions

## Krok 1: Konfiguracja Notion

### 1.1. Utwórz integrację Notion
1. Przejdź do [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Kliknij **"+ New integration"**
3. Nadaj nazwę (np. "Learning Notes Sync")
4. Wybierz workspace, w którym masz swoją bazę danych
5. Kliknij **"Submit"**
6. **SKOPIUJ TOKEN** - będziesz go potrzebować w kroku 2

### 1.2. Udostępnij bazę danych integracji
1. Otwórz swoją bazę danych z notatkami w Notion
2. Kliknij **"Share"** w prawym górnym rogu
3. Kliknij **"Invite"**
4. Znajdź swoją integrację i kliknij **"Invite"**

### 1.3. Pobierz ID bazy danych
Z URL twojej bazy danych skopiuj ID:
```
https://www.notion.so/workspace/TUTAJ_JEST_ID_BAZY_DANYCH?v=...
```

## Krok 2: Konfiguracja GitHub

### 2.1. Dodaj sekretne zmienne (GitHub Secrets)
1. Przejdź do ustawień swojego repozytorium: **Settings → Secrets and variables → Actions**
2. Kliknij **"New repository secret"**
3. Dodaj następujące sekretne zmienne:

| Nazwa | Wartość | Opis |
|-------|---------|------|
| `NOTION_TOKEN` | Token z kroku 1.1 | Token autoryzacyjny Notion |
| `NOTION_DATABASE_ID` | ID z kroku 1.3 | ID twojej bazy danych |

### 2.2. Włącz GitHub Actions
1. Przejdź do zakładki **"Actions"** w swoim repozytorium
2. Jeśli Actions są wyłączone, kliknij **"I understand my workflows, go ahead and enable them"**

## Krok 3: Test Konfiguracji

### 3.1. Uruchom pierwszą synchronizację
1. Przejdź do **Actions → Sync Notion Notes**
2. Kliknij **"Run workflow"**
3. Wybierz branch główny i kliknij **"Run workflow"**

### 3.2. Sprawdź wyniki
Po zakończeniu workflow:
1. Sprawdź czy w repozytorium pojawił się folder `notes/`
2. Sprawdź czy zawiera pliki `.md` z twoimi notatkami

## Krok 4: Webhook (Opcjonalnie - dla synchronizacji w czasie rzeczywistym)

⚠️ **Uwaga**: Ten krok jest opcjonalny. Bez webhook synchronizacja będzie działać codziennie o 8:00 UTC.

### 4.1. Wygeneruj Personal Access Token GitHub
1. Przejdź do **GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Kliknij **"Generate new token (classic)"**
3. Nadaj nazwę (np. "Learning Notes Webhook")
4. Wybierz uprawnienia: **repo** (full control)
5. Kliknij **"Generate token"**
6. **SKOPIUJ TOKEN** - nie będziesz mógł go ponownie zobaczyć

### 4.2. Wdróż serwer webhook

#### Opcja A: Railway (Zalecana)
1. Przejdź na [railway.app](https://railway.app)
2. Zaloguj się przez GitHub
3. Kliknij **"New Project"**
4. Wybierz **"Deploy from GitHub repo"**
5. Wybierz ten repozytorium
6. Dodaj zmienne środowiskowe:
   - `GITHUB_TOKEN`: Token z kroku 4.1
   - `GITHUB_REPO`: `Szyszek25/learning-notes` (lub twoja nazwa użytkownika/repozytorium)
   - `PORT`: `3000`
   - `WEBHOOK_SECRET`: (opcjonalnie) dowolny bezpieczny string

#### Opcja B: Heroku
1. Utwórz nową aplikację Heroku
2. Połącz z tym repozytorium GitHub
3. Dodaj te same zmienne środowiskowe co wyżej
4. Wdróż aplikację

### 4.3. Konfiguracja webhook w Notion
1. Przejdź do ustawień twojej integracji Notion
2. Dodaj webhook URL: `https://twoja-aplikacja.railway.app/webhook`
3. Jeśli ustawiłeś `WEBHOOK_SECRET`, skonfiguruj go również
4. Zapisz zmiany w bazie danych

### 4.4. Test webhook
```bash
# Sprawdź czy serwer działa
curl https://twoja-aplikacja.railway.app/health

# Test webhook
curl -X POST https://twoja-aplikacja.railway.app/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Rozwiązywanie Problemów

### Problem: Workflow nie uruchamia się
**Rozwiązanie:**
1. Sprawdź czy GitHub Actions są włączone
2. Sprawdź czy zmienne `NOTION_TOKEN` i `NOTION_DATABASE_ID` są ustawione
3. Sprawdź czy integracja ma dostęp do bazy danych

### Problem: Brak plików w folderze notes/
**Rozwiązanie:**
1. Sprawdź logi GitHub Actions
2. Upewnij się że baza danych ma kolumnę "Name" lub "Title"
3. Sprawdź czy są jakieś strony w bazie danych

### Problem: Webhook nie działa
**Rozwiązanie:**
1. Sprawdź czy serwer webhook jest dostępny
2. Sprawdź czy `GITHUB_TOKEN` ma prawidłowe uprawnienia
3. Sprawdź logi aplikacji webhook

### Problem: Błąd "Permission denied"
**Rozwiązanie:**
1. Sprawdź czy Personal Access Token ma uprawnienia `repo`
2. Sprawdź czy token nie wygasł

## Dodatkowe Informacje

### Struktura plików
```
notes/
├── nazwa_notatki_1.md
├── nazwa_notatki_2.md
└── ...
```

### Automatyzacja
- Synchronizacja odbywa się codziennie o 8:00 UTC
- Można uruchomić ręcznie przez GitHub Actions
- Z webhook synchronizacja następuje natychmiast po zmianie w Notion

### Bezpieczeństwo
- Używaj `WEBHOOK_SECRET` do weryfikacji webhook
- Personal Access Token powinien mieć minimalne wymagane uprawnienia
- Nie udostępniaj tokenów publicznie

---

**Potrzebujesz pomocy?** Utwórz nowy issue w tym repozytorium z opisem problemu.