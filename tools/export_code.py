import os
import datetime # 日付取得用

EXTENSION_TO_LANG = {
    '.html': 'HTML',
    '.js': 'JavaScript',
    '.css': 'CSS',
}

TARGET_EXTENSIONS = list(EXTENSION_TO_LANG.keys())

def collect_files(root_dir):
    for dirpath, _, filenames in os.walk(root_dir):
        for file in sorted(filenames):
            if any(file.endswith(ext) for ext in TARGET_EXTENSIONS):
                yield os.path.join(dirpath, file)

def export_as_markdown(root_dir, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    
    # タイムスタンプを生成してファイル名に組み込む
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_filename = f"export_{timestamp}.md"
    output_path = os.path.join(output_dir, output_filename)
    
    project_name = os.path.basename(os.path.abspath(root_dir))

    with open(output_path, 'w', encoding='utf-8') as out_file:
        out_file.write(f"# {project_name}\n\n")

        for filepath in collect_files(root_dir):
            relative_path = os.path.relpath(filepath, root_dir)
            _, ext = os.path.splitext(filepath)
            lang = EXTENSION_TO_LANG.get(ext, '')

            out_file.write(f"## {relative_path}\n\n")
            out_file.write(f"```{lang}\n")

            with open(filepath, 'r', encoding='utf-8') as f:
                # 読み込んだ内容の末尾の空白文字を削除
                out_file.write(f.read().rstrip()) 

            out_file.write("\n```\n")

    print(f"Markdown export completed: {output_path}")

if __name__ == "__main__":
    # プロジェクトのルートディレクトリを対象
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    export_dir = os.path.join(project_root, "__export__")
    export_as_markdown(project_root, export_dir)