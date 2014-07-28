__author__ = 'ivadenis'

import hashlib


def main():

  #salt = input("input salt")
  #hash = input("input hash")

  hash = "8a143436b6e6b38079daaae7ab285d4d"
  salt = "8B"

  pwd = calculate_password(salt, hash)
  print("password: " + str(pwd))


def calculate_password(salt, hash):

  in_file_url = "passwords.txt"

  with open(in_file_url, 'r', encoding='utf-8') as infile:
    #word_count = {}

    for line in infile:
      #word_count = count_words(line, word_count)
      #line = line.replace("\n", "")
      line = line.strip()
      converted = doHash(salt, line)
      if ( converted == hash):
        pwd = line
        break
  return pwd

def doHash(salt, value):
  value = value.encode('utf-8')
  salt = salt.encode('utf-8')
  return hashlib.md5(salt + value).hexdigest()



if __name__ == "__main__":
    main()
#EE1FC7F1E884FBEA3895D4E5E289544E