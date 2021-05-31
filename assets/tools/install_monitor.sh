#!/bin/bash
# Created by didiatworkz
# Screenly OSE Monitoring
#
# June 2021
_ANSIBLE_VERSION=2.9.9
_BRANCH=v4.2
#_BRANCH=master

# ==========================

header() {
#clear
tput setaf 172
cat << "EOF"
                            _
   ____                    | |
  / __ \__      _____  _ __| | __ ____
 / / _` \ \ /\ / / _ \| '__| |/ /|_  /
| | (_| |\ V  V / (_) | |  |   <  / /
 \ \__,_| \_/\_/ \___/|_|  |_|\_\/___|
  \____/                www.atworkz.de

        Screenly OSE Monitoring (SOMO)
EOF
tput sgr 0
echo
echo
echo
}

header
echo
echo
read -p "Do you want to install the Screenly OSE Monitoring? (y/N)" -n 1 -r -s INSTALL_BEGIN

if [ "$INSTALL_BEGIN" != "y" ]
then
    echo
    exit
fi

echo
echo
echo
echo -e "[ \e[33mSOMO\e[39m ] Check if port 0.0.0.0:80 in use..."
if ! nc -z localhost 80; then
  echo -e "[ \e[33mSOMO\e[39m ] 0.0.0.0:80 is not in use!"
  echo "----------------------------------------------"
  echo
  echo -e "[ \e[33mSOMO\e[39m ] Start preparation for server installation"
  echo -e "[ \e[33mSOMO\e[39m ] Create /etc/ansible folder"
  sudo mkdir -p /etc/ansible
  echo -e "[ \e[33mSOMO\e[39m ] Add localhost to /etc/ansible/hosts"
  echo -e "[local]\nlocalhost ansible_connection=local" | sudo tee /etc/ansible/hosts > /dev/null
  echo -e "[ \e[33mSOMO\e[39m ] Update apt cache"
  sudo apt update
  echo -e "[ \e[33mSOMO\e[39m ] Remove old package"
  sudo apt-get purge -y python3-setuptools python3-pip python3-pyasn1 libffi-dev
  echo -e "[ \e[33mSOMO\e[39m ] Install new packages"
  sudo apt-get install --no-install-recommends git-core libffi-dev libssl-dev python3-dev python3-pip python3-setuptools python3-wheel -y
  sudo pip3 install ansible=="$_ANSIBLE_VERSION"
  _SERVERMODE="listen 80 default_server;"
  _PORT=""

else
  echo -e "[ \e[33mSOMO\e[39m ] 0.0.0.0:80 is in use!"
  echo -e "[ \e[33mSOMO\e[39m ] Choose port 0.0.0.0:9000"
  _SERVERMODE="listen 9000;"
  _PORT=":9000"
fi
sleep 2
echo -e "[ \e[33mSOMO\e[39m ] Start preparation for installation"
sleep 5
if [ -e /var/www/html/monitor/_functions.php ]
then
  _DEMOLOGIN=""
else
  _DEMOLOGIN="\e[94mUsername: \e[93mdemo\e[39m \n\e[94mPassword: \e[93mdemo\e[39m"
fi
echo -e "[ \e[33mSOMO\e[39m ] Remove old git repository if exists"
sudo rm -rf /tmp/monitor
echo -e "[ \e[33mSOMO\e[39m ] Clone repository"
sudo git clone --branch $_BRANCH https://github.com/didiatworkz/screenly-ose-monitoring.git /tmp/monitor
cd /tmp/monitor/assets/tools/ansible/
echo -e "[ \e[33mSOMO\e[39m ] Create /var/www/monitor folder"
sudo mkdir -p /var/www/html
echo -e "[ \e[33mSOMO\e[39m ] Set installation parameter"
export SERVER_MODE=$_SERVERMODE
export MONITOR_BRANCH=$_BRANCH
echo -e "[ \e[33mSOMO\e[39m ] Start installation"
sudo -E ansible-playbook site.yml
sudo systemctl restart nginx
IP=$(ip route get 8.8.8.8 | sed -n '/src/{s/.*src *\([^ ]*\).*/\1/p;q}')
sleep 2
echo
echo
echo
echo
echo
header
echo -e "[ \e[33mSOMO\e[39m ] Installation finished!"
echo
echo
echo -e "Screenly OSE Monitoring can be started from this address: \n\e[93mhttp://$IP$_PORT\e[39m"
echo
echo -e "$_DEMOLOGIN"
echo
echo
echo
exit
