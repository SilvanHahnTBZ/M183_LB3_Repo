# LB3 Penetrationtesting - Secure TODO App

## 1. Projektbeschreibung

Dieses Projekt basiert auf der vorgegebenen TODO-Listen-Applikation aus dem Modul M183.  
Die ursprüngliche Applikation enthielt mehrere sicherheitsrelevante Schwachstellen. Im Rahmen der LB3 wurden diese Schwachstellen analysiert, behoben und die Applikation erweitert.

Die Applikation bietet folgende Grundfunktionen:

- Login mit Benutzerrollen
- Aufgaben anzeigen
- Aufgaben erstellen
- Aufgaben bearbeiten
- Aufgaben löschen
- Aufgaben suchen
- Admin-Bereich zur Anzeige der Benutzer
- Schutz gegen mehrere typische Web-Schwachstellen

---

## 2. Ziel der Arbeit

Ziel war es, die bestehende TODO-App sicherer zu machen und typische Schwachstellen zu reduzieren oder zu beheben.

Umgesetzte Sicherheitsmassnahmen:

- SQL Injection Schutz durch Prepared Statements
- XSS Schutz durch HTML Escaping
- Session-basierte Authentifizierung
- Rollenprüfung für Admin-Bereich
- CSRF-Schutz bei Create, Update und Delete
- Delete nur noch per POST statt GET
- Brute-Force-Schutz beim Login
- Security Headers mit Helmet
- Input Validation
- Passwort-Hashing mit bcrypt
- Keine Anzeige von Passwort-Hashes im Admin-Bereich

---

## 3. Projektstruktur

```text
docker/
├── db/
│   ├── Dockerfile
│   └── m183_lb2.sql
├── php/
│   └── Dockerfile
├── compose.db.yaml
└── compose.node.yaml

todo-list-node/
├── admin/
│   └── users.js
├── fw/
│   ├── db.js
│   ├── footer.js
│   ├── header.js
│   └── security.js
├── public/
│   └── style.css
├── search/
│   └── v2/
│       └── index.js
├── user/
│   ├── backgroundsearch.js
│   └── tasklist.js
├── app.js
├── config.js
├── delete.js
├── edit.js
├── index.js
├── login.js
├── package.json
├── package-lock.json
├── savetask.js
└── search.js
```

---

## 4. Voraussetzungen

- Docker Desktop
- Visual Studio Code
- Webbrowser (Chrome / Edge)
- PowerShell oder Terminal

---

## 5. Projekt starten

### 5.1 In den Docker-Ordner wechseln

```bash
cd C:\Users\StartKlar\Documents\Project_M183\docker
```

### 5.2 Container starten

```bash
docker compose -f compose.node.yaml up --build
```

### 5.3 Anwendung öffnen

```
http://localhost
```

### 5.4 Container stoppen

```bash
docker compose -f compose.node.yaml down
```

---

## 6. Login-Daten

Admin  
Username: admin1  
Password: Awesome.Pass34

User  
Username: user1  
Password: Amazing.Pass23

---

## 7. Funktionen

### Login
- bcrypt Passwortprüfung
- Brute-Force-Schutz
- Session-basierte Authentifizierung

### Tasks
- Nur eigene Tasks sichtbar
- Create / Edit / Delete möglich
- Validierung + CSRF Schutz

### Delete Sicherheit

Nicht erlaubt:
```
/delete?id=1
```

Erwartung:
```
Cannot GET /delete
```

Delete funktioniert nur über:
```
POST /delete + CSRF Token
```

### Suche
- Nur eigene Tasks
- Eingaben validiert
- Prepared Statements

### Admin Bereich
- Nur für Admin sichtbar
- Zugriff sonst: Access denied

---

## 8. Sicherheitsmassnahmen

### SQL Injection

```javascript
await conn.execute(
  'SELECT ID FROM tasks WHERE ID = ? AND userID = ?',
  [taskId, userId]
);
```

### XSS Schutz

```javascript
security.escapeHtml(value)
```

### Session Security

```javascript
app.use(session({
  name: 'session-id',
  secret: process.env.SESSION_SECRET || 'very-strong-secret',
  cookie: {
    httpOnly: true,
    sameSite: 'strict'
  }
}));
```

### CSRF Schutz

```html
<input type="hidden" name="csrfToken">
```

```javascript
security.validateCsrfToken(req)
```

### Brute Force Schutz

```text
MAX_ATTEMPTS = 5
LOCK_TIME = 5 Minuten
```

### Helmet

```javascript
app.use(helmet({
  contentSecurityPolicy: false
}));
```

### Input Validation

- Task Titel max 255 Zeichen
- Search max 100 Zeichen
- State nur gültige Werte
- ID nur numerisch

---

## 9. Passwort-Sicherheit (Wichtiger Hinweis)

Die aktuell verwendeten Passwörter im Projekt entsprechen **nicht vollständig modernen Sicherheitsrichtlinien**, da sie primär zu Testzwecken definiert wurden.

### Aktuelle Passwörter (Testzweck)

- Awesome.Pass34
- Amazing.Pass23

Diese sind zwar relativ komplex, erfüllen jedoch **nicht alle aktuellen Best Practices**.

### Aktuelle Passwort-Standards (Empfehlungen)

Moderne Sicherheitsrichtlinien (z. B. OWASP / NIST) empfehlen:

- Mindestlänge: **12–16 Zeichen**
- Kombination aus:
    - Gross- und Kleinbuchstaben
    - Zahlen
    - Sonderzeichen
- Keine einfachen oder häufigen Wörter
- Keine persönlichen Daten
- Nutzung von **Passphrasen** statt kurzen Passwörtern
- Vermeidung von Wiederverwendung
- Optional: Multi-Faktor-Authentifizierung (MFA)

### Beispiel für ein sicheres Passwort

```
MySecure!Passphrase2026#
```

oder besser als Passphrase:

```
Correct-Horse-Battery-Staple-2026!
```

### Empfehlung

Für eine produktive Anwendung sollten:

- Passwort-Richtlinien serverseitig validiert werden
- Passwort-Policies erzwungen werden
- MFA implementiert werden
- Regelmässige Sicherheitsüberprüfungen erfolgen

---

## 10. Testprotokoll

### 10.1 Testumgebung

- Windows 10
- Chrome / Edge
- Docker Setup
- http://localhost

### 10.2 Testfälle

| Nr. | Test                    | Erwartung                    | Ergebnis |
|-----|------------------------|-----------------------------|----------|
| 1   | Login korrekt          | Login erfolgreich           | OK       |
| 2   | Login falsch           | Fehlermeldung               | OK       |
| 3   | SQL Injection Login    | Kein Login möglich          | OK       |
| 4   | SQL Injection Suche    | Keine fremden Daten         | OK       |
| 5   | XSS                    | Script wird nicht ausgeführt| OK       |
| 6   | Fremde Task öffnen     | Access denied               | OK       |
| 7   | Admin Zugriff User     | Access denied               | OK       |
| 8   | Delete via GET         | Blockiert                   | OK       |
| 9   | Delete ohne CSRF       | Blockiert                   | OK       |
| 10  | Brute Force            | Login gesperrt              | OK       |
| 11  | Session Manipulation   | Keine Wirkung               | OK       |
| 12  | Zugriff ohne Login     | Redirect                    | OK       |

---

## 11. Hinweise

Secure Cookie:
```
secure: false
```

CSP deaktiviert:
```
contentSecurityPolicy: false
```

Session Store:

Aktuell: Memory Store  
Für Produktion: Redis / DB empfohlen

---

## 12. Docker Befehle

```bash
docker ps
docker compose -f compose.node.yaml down
docker compose -f compose.node.yaml up --build
docker logs m183-lb2-web
```

---

## 13. Fazit

Die Anwendung wurde erfolgreich abgesichert gegen:

- SQL Injection
- XSS
- CSRF
- Session Manipulation
- Brute Force
- Unsichere DELETE Requests