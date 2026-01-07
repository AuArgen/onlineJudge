#!/bin/bash

# Түстөр
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Компиляторлорду текшерүү жана орнотуу башталууда...${NC}"

# Функция: Программа бар-жогун текшерет, жок болсо орнотот
check_and_install() {
    PACKAGE_NAME=$1
    CMD_NAME=$2

    if command -v $CMD_NAME &> /dev/null; then
        VERSION=$($CMD_NAME --version | head -n 1)
        echo -e "${GREEN}✔ $CMD_NAME орнотулган:${NC} $VERSION"
    else
        echo -e "${YELLOW}➜ $CMD_NAME табылган жок. Орнотулууда...${NC}"
        sudo apt-get update
        sudo apt-get install -y $PACKAGE_NAME
        echo -e "${GREEN}✔ $CMD_NAME ийгиликтүү орнотулду!${NC}"
    fi
}

# 1. Python (Көбүнчө орнотулган болот)
check_and_install python3 python3

# 2. C++ (G++)
check_and_install g++ g++

# 3. Java (Default JDK)
# Javaнын версиясын текшерүү буйругу башкачараак
if command -v javac &> /dev/null; then
    echo -e "${GREEN}✔ Java (javac) орнотулган.${NC}"
else
    echo -e "${YELLOW}➜ Java табылган жок. Орнотулууда...${NC}"
    sudo apt-get update
    sudo apt-get install -y default-jdk
    echo -e "${GREEN}✔ Java ийгиликтүү орнотулду!${NC}"
fi

# 4. Node.js (JavaScript)
check_and_install nodejs node

# 5. Go (Golang)
if command -v go &> /dev/null; then
    VERSION=$(go version)
    echo -e "${GREEN}✔ Go орнотулган:${NC} $VERSION"
else
    echo -e "${YELLOW}➜ Go табылган жок. Орнотулууда...${NC}"
    sudo apt-get update
    sudo apt-get install -y golang-go
    echo -e "${GREEN}✔ Go ийгиликтүү орнотулду!${NC}"
fi

echo -e "\n${GREEN}Бардык текшерүүлөр бүттү!${NC}"
