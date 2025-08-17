# Steps to Create a Custom Phone Case Printing Website

This document outlines the steps to create a web application where users can upload an image, place it on a phone case template, and print the final design.

## 1. Frontend Development

### HTML Structure (`index.html`)

-   **Image Upload:**
    -   Create an `<input type="file" id="imageLoader" accept="image/*">` to allow users to upload images.
-   **Phone Model Selection:**
    -   Create a `<select id="phoneModelSelector">` dropdown to list available phone models.
    -   Populate this dropdown with options, where each option has a `value` attribute corresponding to the phone model's dimensions (e.g., `value="iphone-13-pro_6.1"`).
-   **Design Canvas:**
    -   Create a `<canvas id="caseCanvas">` element. This will be the main area for designing the phone case.
-   **Control Buttons:**
    -   Add a `<button id="finalizeButton">` to finalize the design.
    -   Add a `<button id="printButton">` to print the final design.

### JavaScript Logic (`app.js`)

-   **Canvas Setup:**
    -   Get a reference to the canvas and its 2D rendering context: `const canvas = document.getElementById('caseCanvas'); const ctx = canvas.getContext('2d');`
-   **Phone Model Data:**
    -   Create a JavaScript object to store the dimensions of the phone cases for different models.
-   **Event Listeners:**
    -   **Image Upload:** Add a `change` event listener to the `#imageLoader` to handle the uploaded image. Use `FileReader` to read the image data and create an `Image` object.
    -   **Phone Model Selection:** Add a `change` event listener to the `#phoneModelSelector`. When the user selects a model, clear the canvas and draw the phone case template based on the selected model's dimensions.
    -   **Image Manipulation:**
        -   Implement event listeners for `mousedown`, `mousemove`, and `mouseup` (or `touchstart`, `touchmove`, `touchend` for mobile) on the canvas.
        -   These listeners will allow the user to drag (translate), resize (scale), and rotate the uploaded image on the canvas.
-   **Drawing Logic:**
    -   **Draw Phone Case Template:** Create a function to draw the outline of the phone case on the canvas based on the selected model's dimensions.
    -   **Draw Image:** Draw the user's uploaded image onto the canvas.
    -   **Redraw Canvas:** In the `mousemove` (or `touchmove`) event listener, continuously clear and redraw the canvas to show the image being moved in real-time.
-   **Finalize and Print:**
    -   **Finalize:** When the "Finalize" button is clicked, draw the image and the phone case template onto the canvas one last time. This will "flatten" the design.
    -   **Print:** When the "Print" button is clicked, use `window.print()` to open the browser's print dialog.

### CSS Styling (`style.css`)

-   Style the page elements for a clean and user-friendly interface.
-   Ensure the canvas and controls are well-organized and responsive to different screen sizes.

## 2. Backend Development (Golang)

Using a Golang backend for its performance and concurrency features. It will handle file uploads, store data in a PostgreSQL database, and serve the frontend files.

### Using Podman for the Backend Server

Containerizing the backend with Podman simplifies deployment and ensures a consistent environment.

#### Dockerfile (for Golang)

Create a `Dockerfile` in your project's root directory. This will be a multi-stage build to create a small, optimized production image.

```Dockerfile
# Stage 1: Build the application
FROM golang:1.19-alpine AS builder

WORKDIR /app

COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/. .

RUN CGO_ENABLED=0 GOOS=linux go build -o /main .

# Stage 2: Create the final, small image
FROM alpine:latest

WORKDIR /root/

COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"] 
```

#### Building and Running the Container

-   **Build the image:** `podman build -t your-app-name .`
-   **Run the container:** `podman run -p 8080:8080 your-app-name`

### Using PostgreSQL and GORM

To store information about uploaded images, you can use a PostgreSQL database with the GORM library for object-relational mapping and migrations.

#### Podman Compose (`docker-compose.yml`)

Use Podman Compose to manage the Golang backend and the PostgreSQL database together. Note that `podman-compose` uses the `docker-compose.yml` file format.

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - POSTGRES_HOST=db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=imagedb
    depends_on:
      - db

  db:
    image: postgres:14.1
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=imagedb
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

-   **Run with Podman Compose:** `podman-compose up`

#### GORM for Database Migrations

-   **GORM Model:** Define a GORM model in your Golang application to represent the `images` table:

    ```go
    package main

    import "gorm.io/gorm"

    type Image struct {
        gorm.Model
        Filename string
        Filepath string
    }
    ```

-   **Auto-migration:** Use GORM's auto-migration feature to automatically create or update the database schema:

    ```go
    import (
        "gorm.io/driver/postgres"
        "gorm.io/gorm"
    )

    func main() {
        dsn := "host=db user=user password=password dbname=imagedb port=5432 sslmode=disable"
        db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
        if err != nil {
            panic("failed to connect database")
        }

        // Migrate the schema
        db.AutoMigrate(&Image{})

        // ... rest of your application logic
    }
    ```

#### Storing Image Information

-   **Backend Logic:**
    -   When a user uploads an image, the Golang server will:
        1.  Save the image file to a persistent volume.
        2.  Create a new `Image` struct with the filename and path.
        3.  Use GORM to save the `Image` struct to the PostgreSQL database.

## Example Code Snippet (JavaScript)

```javascript
// Basic image manipulation logic
let isDragging = false;
let imageX = 50;
let imageY = 50;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = canvas.getBoundingClientRect();
        imageX = e.clientX - rect.left;
        imageY = e.clientY - rect.top;
        redrawCanvas(); // Function to clear and redraw the canvas
    }
});

canvas.addEventListener('mouseup', (e) => {
    isDragging = false;
});
```