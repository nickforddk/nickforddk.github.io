# YAML Static Site Generator

This project is a static site generator that uses a YAML configuration file to create a bilingual website in English and Danish. It leverages Tailwind CSS for styling and Nunjucks for templating.

## Features

- **Bilingual Support**: The site supports both English and Danish languages.
- **Tailwind CSS**: Utilizes Tailwind CSS for responsive and modern styling.
- **Static Site Generation**: Generates static HTML pages based on a YAML configuration file.
- **Modular Templates**: Uses Nunjucks for templating, allowing for reusable components.

## Project Structure

```
yaml-static-site
├── src
│   ├── app.ts                # Entry point of the application
│   ├── templates             # Contains Nunjucks templates
│   │   ├── base.njk         # Base template for the website
│   │   ├── index.njk        # Main template for the index page
│   │   └── partials          # Reusable template partials
│   │       ├── head.njk     # Head section of the HTML document
│   │       ├── header.njk   # Header section of the HTML document
│   │       └── footer.njk   # Footer section of the HTML document
│   ├── styles                # Contains stylesheets
│   │   └── tailwind.css      # Tailwind CSS styles
│   ├── data                  # Contains data files
│   │   └── site.yml          # YAML configuration file
│   ├── types                 # TypeScript types and interfaces
│   │   └── index.ts          # Type definitions
│   └── utils                 # Utility functions
│       ├── build.ts          # Functions for building the static site
│       └── i18n.ts           # Internationalization functions
├── public                     # Public assets
│   └── robots.txt            # Robots.txt for web crawlers
├── package.json               # npm configuration file
├── tsconfig.json             # TypeScript configuration file
├── tailwind.config.js         # Tailwind CSS configuration file
├── postcss.config.js          # PostCSS configuration file
├── .gitignore                 # Git ignore file
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd yaml-static-site
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Build the project**:
   ```
   npm run build
   ```

4. **Start the development server**:
   ```
   npm run start
   ```

5. **Access the site**:
   Open your browser and navigate to `http://localhost:3000` (or the specified port).

## Usage

- Modify the `src/data/site.yml` file to update the content and configuration of the site.
- Customize styles in `src/styles/tailwind.css`.
- Add new pages by creating new Nunjucks templates in the `src/templates` directory.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.