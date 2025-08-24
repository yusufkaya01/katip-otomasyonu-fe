#!/usr/bin/env python3
import re

def fix_vcf_file(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as infile:
        content = infile.read()
    
    # Fix the VCF format issues
    fixed_content = content
    
    # Change VERSION from 4.0 to 3.0 for better compatibility
    fixed_content = re.sub(r'VERSION:4\.0', 'VERSION:3.0', fixed_content)
    
    # Replace NAME with N (proper vCard format)
    # Extract the NAME value and convert to N format (Family;Given;Additional;Prefix;Suffix)
    fixed_content = re.sub(r'NAME:([^\n]+)', lambda m: f'N:{m.group(1)};;;;', fixed_content)
    
    # Fix phone numbers: PHONE.CELL -> TEL;TYPE=CELL
    fixed_content = re.sub(r'PHONE\.CELL:([^\n]+)', lambda m: f'TEL;TYPE=CELL:{m.group(1).replace(" ", "")}', fixed_content)
    
    # Fix email: EMAIL.WORK -> EMAIL;TYPE=WORK
    fixed_content = re.sub(r'EMAIL\.WORK:([^\n]+)', r'EMAIL;TYPE=WORK:\1', fixed_content)
    
    # Remove any duplicate empty lines
    fixed_content = re.sub(r'\n\n+', '\n', fixed_content)
    
    # Ensure proper line endings
    fixed_content = fixed_content.replace('\r\n', '\n').replace('\r', '\n')
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        outfile.write(fixed_content)
    
    print(f"Fixed VCF file saved as: {output_file}")

if __name__ == "__main__":
    fix_vcf_file("fileconverts.vcf", "fileconverts_fixed.vcf")
