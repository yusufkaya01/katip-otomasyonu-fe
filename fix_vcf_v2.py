#!/usr/bin/env python3
import re

def fix_vcf_file(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as infile:
        content = infile.read()
    
    # Split into individual vCards
    vcards = content.split('BEGIN:VCARD')
    fixed_vcards = []
    
    for i, vcard in enumerate(vcards):
        if i == 0:  # Skip empty first element
            continue
            
        # Add back BEGIN:VCARD
        vcard = 'BEGIN:VCARD' + vcard
        
        # Fix VERSION
        vcard = re.sub(r'VERSION:4\.0', 'VERSION:3.0', vcard)
        
        # Extract FN (formatted name) for better N field creation
        fn_match = re.search(r'FN:([^\n]+(?:\n\s+[^\n]+)*)', vcard)
        if fn_match:
            fn_value = fn_match.group(1)
            # Remove line continuation spaces
            fn_value = re.sub(r'\n\s+', ' ', fn_value)
            
            # Replace NAME with proper N field (just use the company name as family name)
            vcard = re.sub(r'NAME:[^\n]+(?:\n\s+[^\n]+)*', f'N:{fn_value};;;;', vcard)
        
        # Fix phone numbers
        vcard = re.sub(r'PHONE\.CELL:([^\n]+)', lambda m: f'TEL;TYPE=CELL:{m.group(1).replace(" ", "")}', vcard)
        
        # Fix email
        vcard = re.sub(r'EMAIL\.WORK:([^\n]+)', r'EMAIL;TYPE=WORK:\1', vcard)
        
        # Clean up the FN field too (remove line continuations)
        if fn_match:
            vcard = re.sub(r'FN:[^\n]+(?:\n\s+[^\n]+)*', f'FN:{fn_value}', vcard)
        
        fixed_vcards.append(vcard)
    
    # Join all vcards
    fixed_content = '\n'.join(fixed_vcards)
    
    # Remove any duplicate empty lines
    fixed_content = re.sub(r'\n\n+', '\n', fixed_content)
    
    # Ensure proper line endings
    fixed_content = fixed_content.replace('\r\n', '\n').replace('\r', '\n')
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write(fixed_content)
    
    print(f"Fixed VCF file saved as: {output_file}")
    print(f"Number of vCards processed: {len(fixed_vcards)}")

if __name__ == "__main__":
    fix_vcf_file("fileconverts.vcf", "fileconverts_fixed_v2.vcf")
