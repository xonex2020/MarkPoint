import os

output_file = "projekt_uebersicht.txt"
exclude_dirs = {"node_modules", ".git", "dist", ".next", ".venv", "__pycache__"}

def save_all_files(root_dir, output_file):
    with open(output_file, "w", encoding="utf-8") as out:
        for foldername, subfolders, filenames in os.walk(root_dir):
            # Ordner rausfiltern, die übersprungen werden sollen
            subfolders[:] = [d for d in subfolders if d not in exclude_dirs]
            for filename in filenames:
                if filename == output_file:
                    continue  # Nicht die Output-Datei selbst nochmal einlesen
                file_path = os.path.join(foldername, filename)
                rel_path = os.path.relpath(file_path, root_dir)
                out.write(f"\n{'='*40}\nDatei: {rel_path}\n{'='*40}\n")
                try:
                    with open(file_path, "r", encoding="utf-8", errors="replace") as file:
                        out.write(file.read())
                except Exception as e:
                    out.write(f"[Konnte Datei nicht lesen: {e}]\n")

if __name__ == "__main__":
    save_all_files(".", output_file)
    print(f"Fertig! Übersicht gespeichert in '{output_file}' (ohne node_modules und ähnliche Ordner)")
