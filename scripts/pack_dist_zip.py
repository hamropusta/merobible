import os
import zipfile
import shutil

def pack_cpanel_zips():
    os.makedirs("public", exist_ok=True)
    if not os.path.exists("dist"):
        print("dist directory not found! Run npm run build first.")
        return

    # 1. Generate public/dist-only.zip (Static website for cPanel public_html)
    # Extracts directly into public_html without extra subfolder
    dist_zip_path = "public/dist-only.zip"
    print(f"Creating {dist_zip_path} directly from dist/...")
    with zipfile.ZipFile(dist_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk("dist"):
            for file in files:
                if file.endswith('.zip'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, "dist")
                zipf.write(full_path, rel_path)
    
    dist_size_mb = os.path.getsize(dist_zip_path) / (1024 * 1024)
    print(f"Generated {dist_zip_path} ({dist_size_mb:.2f} MB)")

    # 2. Generate public/susamachar-cpanel-ready.zip (Full deployment package)
    cpanel_zip_path = "public/susamachar-cpanel-ready.zip"
    print(f"Creating {cpanel_zip_path} (Full cPanel deployment package)...")
    with zipfile.ZipFile(cpanel_zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Include all dist files in public_html/ inside the package
        for root, dirs, files in os.walk("dist"):
            for file in files:
                if file.endswith('.zip'):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, "dist")
                zipf.write(full_path, os.path.join("public_html", rel_path))
                # Also include directly in root for convenience
                zipf.write(full_path, rel_path)

        # Include schema.sql
        if os.path.exists("database/schema.sql"):
            zipf.write("database/schema.sql", "database/schema.sql")

        # Include data state if present
        if os.path.exists("data/susamachar-state.json"):
            zipf.write("data/susamachar-state.json", "data/susamachar-state.json")

        # Include instructions in Nepali and English
        readme_content = """===============================================================
सुसमाचार (biblesandes.com) - cPanel Update & Deploy Guide
===============================================================

यो ZIP फाइल biblesandes.com लाई cPanel मा १-क्लिकमा अपडेट गर्न तयार गरिएको हो।

चरण १: cPanel लगइन गर्नुहोस्
1. आफ्नो cPanel ड्यासबोर्ड खोल्नुहोस्।
2. "File Manager" मा क्लिक गर्नुहोस्।
3. "public_html" फोल्डर भित्र जानुहोस्।

चरण २: फाइल अपलोड र एक्सट्रयाक्ट गर्नुहोस्
1. माथि "Upload" बटन थिची यो dist-only.zip (वा susamachar-cpanel-ready.zip) फाइल अपलोड गर्नुहोस्।
2. अपलोड सकिएपछि public_html भित्र आएर फाइलमा Right Click गरी "Extract" गर्नुहोस्।
3. फाइलहरू सिधै public_html भित्र एक्सट्रयाक्ट हुनेछन् (index.html, .htaccess, assets/ आदि)।

चरण ३: .htaccess सुनिश्चित गर्नुहोस्
- यस जिप फाइलमा .htaccess समावेश छ जसले गर्दा /about, /terms, /privacy, /news आदि सबै पृष्ठहरू बिना कुनै त्रुटि खुल्छन्।
- यदि cPanel मा .htaccess देखिएन भने File Manager को "Settings" मा गएर "Show Hidden Files (dotfiles)" चेक गर्नुहोस्।

चरण ४: सफलता!
- अब https://biblesandes.com खोलेर हेर्नुहोस्, सबै नयाँ फिचर, अपडेटेड न्युज, भजन र सफा डिजाइन तुरुन्तै चालु हुनेछ।
===============================================================
"""
        zipf.writestr("CPANEL_UPDATE_INSTRUCTIONS_NEPALI.txt", readme_content)

    cpanel_size_mb = os.path.getsize(cpanel_zip_path) / (1024 * 1024)
    print(f"Generated {cpanel_zip_path} ({cpanel_size_mb:.2f} MB)")

if __name__ == "__main__":
    pack_cpanel_zips()
