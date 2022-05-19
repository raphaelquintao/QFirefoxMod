#!/bin/bash 

dir_profiles=~/.mozilla/firefox
dir_cache=~/.cache/mozilla/firefox

SCRIPT_DIR="$( cd "$( dirname "$0" )" && pwd )"

clear

echo -e "\e[1m\e[33m--- Firefox MOD ---\e[0m"

profiles=($(ls -F $dir_profiles | grep -E '\..+/$' | cut -d '/' -f 1))

# echo ${profiles[@]}

# for p in ${profiles[@]}; do
#     echo "* $p"

#     done

function check_install {
    if [ -d "$dir_profiles/$@/chrome" ]; then
        echo -en "\e[32mInstalled!\e[0m"
    else
        echo -en "\e[31mNot Installed!\e[0m"
    fi
}

function link_chrome_folder {
    link="$dir_profiles/$@/chrome"
    if [ -L ${link} ] ; then
        rm $link
    fi
    ln -fs "$SCRIPT_DIR/chrome" "$dir_profiles/$@/chrome"
    echo -e "\e[32m - Installed for\e[0m $@"
}


function clear_cache {
    cache_dir="$dir_cache/$@/startupCache"
    if [ -d $cache_dir ]; then
        rm -r $cache_dir
        echo -e "\e[32m - Cache cleared!\e[0m"
    fi
}

count=0
for i in "${!profiles[@]}"; do 
    printf " * %s - %s | %s\n" "$i" "${profiles[$i]}" "$(check_install ${profiles[$i]})"
    ((count = count + 1))
done
# echo $count

read -r -s -n1 -p "Select a profile to install or press c to cancel: " ps


if [[ "$ps" =~ ^[0-9]+$ && "$ps" < "$count" ]]; then 
    echo -e $ps"\n"
    p_selected=${profiles[$ps]}
    echo -e "\e[1m\e[33mSelected: \e[0m"$p_selected

    link_chrome_folder $p_selected
    clear_cache $p_selected
    # check_install $p_selected
    # echo ''

else
    echo -e "\nDone!"
    exit 0
fi










