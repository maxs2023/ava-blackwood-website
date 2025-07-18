import re
import os

def to_camel_case(text):
    """Converts a string like 'Legal Romance' to 'legalRomance'."""
    s = text.replace("-", " ").replace("_", " ")
    s = s.split()
    if len(text) == 0:
        return text
    return s[0].lower() + ''.join(i.capitalize() for i in s[1:])

def add_book_to_jsx(
    jsx_file_path,
    book_id,
    title,
    full_title,
    description,
    amazon_url,
    publish_date,
    series,
    cover_image_filename,
    rating,
    genre
):
    """
    Automates adding a new book to the App.jsx file.

    Args:
        jsx_file_path (str): The full path to the App.jsx file.
        book_id (int): The unique ID for the new book.
        title (str): The short title of the book.
        full_title (str): The full title of the book.
        description (str): The book's description.
        amazon_url (str): The Amazon purchase URL.
        publish_date (str): The publication year.
        series (str): The series the book belongs to.
        cover_image_filename (str): The filename of the cover image (e.g., 'My New Book.jpg').
        rating (float): The book's rating.
        genre (str): The genre of the book (e.g., 'Legal Romance').
    """
    if not os.path.exists(jsx_file_path):
        print(f"Error: The file '{jsx_file_path}' was not found.")
        return

    # Generate variable names from the title and genre
    cover_variable_name = to_camel_case(title) + "Cover"
    genre_camel_case = to_camel_case(genre.split(' ')[0]) # e.g., 'legal' from 'Legal Romance'

    # --- 1. Read the existing JSX content ---
    with open(jsx_file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # --- 2. Add the new cover import statement ---
    new_import_statement = f"import {cover_variable_name} from './assets/{cover_image_filename}'\n"
    import_insertion_point = -1
    for i, line in enumerate(lines):
        if "import authorPhoto" in line:
            import_insertion_point = i
            break
    
    if import_insertion_point != -1:
        lines.insert(import_insertion_point, new_import_statement)
        print(f"SUCCESS: Added import statement for '{cover_image_filename}'.")
    else:
        print("Warning: Could not find the author photo import line. Placing new import at the top.")
        lines.insert(0, new_import_statement)

    # --- 3. Create the new book object string ---
    new_book_object = f"""
    {{ 
      id: {book_id}, 
      title: "{title}", 
      fullTitle: "{full_title}",
      description: "{description}", 
      amazonUrl: "{amazon_url}", 
      publishDate: "{publish_date}", 
      series: "{series}", 
      cover: {cover_variable_name},
      rating: {rating},
      genre: "{genre}"
    }},"""

    # --- 4. Add the book object to the booksData constant ---
    content_str = "".join(lines)
    books_data_regex = re.compile(r"const booksData = {(.+?)};", re.DOTALL)
    match = books_data_regex.search(content_str)

    if not match:
        print("Error: Could not find the 'booksData' object in the file.")
        return

    books_data_content = match.group(1)
    genre_regex = re.compile(rf"\b{genre_camel_case}:\s*\[", re.IGNORECASE)

    if genre_regex.search(books_data_content):
        # Genre exists, add the book to the existing array
        closing_bracket_regex = re.compile(rf"(\b{genre_camel_case}:\s*\[(?:.|\n)*?)(\s*\])", re.IGNORECASE)
        content_str = closing_bracket_regex.sub(r"\1" + new_book_object + r"\2", content_str, 1)
        print(f"SUCCESS: Added new book to existing genre '{genre_camel_case}'.")
    else:
        # Genre does not exist, create a new genre array and update UI
        new_genre_array = f"""
  {genre_camel_case}: [{new_book_object}
  ],"""
        # Insert the new genre array into booksData
        insertion_point_regex = re.compile(r"(const booksData = {\s*)", re.DOTALL)
        content_str = insertion_point_regex.sub(r"\1" + new_genre_array, content_str, 1)
        
        # Update getAllBooks function
        get_all_books_regex = re.compile(r"(return \[\n(?:.|\n)*?)(\s*\];)", re.DOTALL)
        content_str = get_all_books_regex.sub(r"\1      ...booksData.{genre_camel_case},\n\2", content_str, 1)

        # Add new filter button
        new_button_str = f"""
            <Button
              variant={{selectedGenre === '{genre_camel_case}' ? 'default' : 'outline'}}
              onClick={{() => setSelectedGenre('{genre_camel_case}')}}
              className={{selectedGenre === '{genre_camel_case}' ? 'bg-primary text-white' : 'text-gray-700 border-gray-300 hover:text-burgundy'}}
            >
              {genre} ({{booksData.{genre_camel_case}.length}})
            </Button>"""
        
        button_insertion_regex = re.compile(r"(<div className=\"flex flex-wrap gap-2\">\n(?:.|\n)*?)(<\/div>)", re.DOTALL)
        content_str = button_insertion_regex.sub(r"\1" + new_button_str + r"\n            \2", content_str, 1)
        print(f"SUCCESS: Created new genre '{genre_camel_case}' and added book and UI elements.")


    # --- 5. Write the updated content back to the file ---
    with open(jsx_file_path, 'w', encoding='utf-8') as f:
        f.write(content_str)
    
    print(f"\n✅ App.jsx has been successfully updated with the new book: '{title}'.")


# --- EXAMPLE USAGE ---
if __name__ == "__main__":
    # --- Configuration ---
    # IMPORTANT: Replace this with the actual path to your App.jsx file
    path_to_app_jsx = "App.jsx" 

    # --- New Book Details ---
    # Fill in the details for the book you want to add
    add_book_to_jsx(
        jsx_file_path=path_to_app_jsx,
        book_id=9,
        title="Whispers in the Stacks",
        full_title="Whispers in the Stacks: A Librarian's Secret",
        description="In the quietest corners of the university library, a forbidden romance between a librarian and a mysterious patron unfolds through whispered words and hidden notes.",
        amazon_url="https://www.amazon.com/example-whispers",
        publish_date="2025",
        series="Standalone",
        cover_image_filename="Whispers in the Stacks.jpg",
        rating=4.7,
        genre="Library Romance" # This will create a new category
    )

    # Example for an existing category
    # add_book_to_jsx(
    #     jsx_file_path=path_to_app_jsx,
    #     book_id=10,
    #     title="Final Exam",
    #     full_title="Final Exam: A Dark Academia Thriller",
    #     description="The final exam is more than just a test; it's a matter of life and death. A thrilling romance where academic rivalry turns deadly.",
    #     amazon_url="https://www.amazon.com/example-final-exam",
    #     publish_date="2025",
    #     series="Dark Academia",
    #     cover_image_filename="Final Exam.jpg",
    #     rating=4.8,
    #     genre="Dark Academia" # This will add to the existing 'darkAcademia' array
    # )
