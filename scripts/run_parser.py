"""One-shot parser script — run after scraping to convert XML → CSV."""
import multiprocessing
import glob
import os

if multiprocessing.get_start_method(allow_none=True) is None:
    multiprocessing.set_start_method("fork")

if __name__ == "__main__":
    from il_supermarket_parsers import ConvertingTask

    print("Parsing 921 downloaded XML files (PRICE_FILE + STORE_FILE)...")
    task = ConvertingTask(
        data_folder="dumps",
        output_folder="outputs",
        files_types=["PRICE_FILE", "STORE_FILE"],
    )
    task.start()

    files = glob.glob("outputs/*.csv")
    print(f"\nGenerated {len(files)} CSV files:")
    for f in sorted(files):
        print(f"  {f} ({os.path.getsize(f):,} bytes)")
