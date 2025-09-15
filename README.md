# Spotify Clone

A web-based music player designed to replicate the core user interface and functionality of Spotify. This project is built with vanilla HTML, CSS, and JavaScript, demonstrating modern web development techniques without relying on external frameworks.



## 🎶 Features

* **Dynamic Playlists**: Browse and load different playlists (e.g., Arijit Singh, KK Hits).
* **Music Playback Controls**: Full control over your music with play, pause, next, and previous buttons.
* **Seekable Progress Bar**: Click anywhere on the seekbar to jump to a specific point in the song.
* **Volume Control**: Adjust the volume with a slider and a one-click mute button.
* **Dynamic Song Information**: The playbar updates to show the current song's title and artist.
* **Responsive Design**: The interface is fully responsive, with a collapsible sidebar (hamburger menu) for mobile devices.
* **Mobile-First UX**: Clicking a playlist on mobile automatically opens the song list for immediate access.

## 🛠️ Tech Stack

This project was built using fundamental web technologies:

* **HTML5**: For the structure and content of the application.
* **CSS3**: For all styling, layout, and responsive design (including Flexbox).
* **JavaScript (ES6+)**: For all application logic, including:
    * Asynchronous operations (`async/await`) to fetch playlist data.
    * DOM manipulation to dynamically update content.
    * HTML5 Audio API for music playback and control.

## 🚀 Local Setup and Installation

To run this project on your local machine, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Soumen8603/Spotify_Clone.git](https://github.com/Soumen8603/Spotify_Clone.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd Spotify_Clone
    ```

3.  **Run a local server:**
    Since the project uses `fetch` to load JSON files, it needs to be run on a server. The easiest way is with the VS Code **Live Server** extension.
    * Install the "Live Server" extension from the VS Code marketplace.
    * Right-click on the `index.html` file and select "Open with Live Server".
