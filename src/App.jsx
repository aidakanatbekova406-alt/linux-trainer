
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3001";

const commands = [
  { command:"pwd", meaning:"Показывает путь к текущей директории.", when:"Когда нужно узнать, в какой папке ты сейчас находишься.", example:"pwd", result:"/home/user", question:"Как узнать путь к текущей директории?", options:["pwd","ls","cd","mkdir"], correct:"pwd" },
  { command:"ls", meaning:"Показывает содержимое директории.", when:"Когда нужно посмотреть файлы и папки в текущей директории.", example:"ls", result:"Documents  Downloads  notes.txt", question:"Какая команда показывает содержимое директории?", options:["cd","ls","pwd","touch"], correct:"ls" },
  { command:"cd", meaning:"Переходит в другую директорию.", when:"Когда нужно перейти в нужную папку.", example:"cd Documents", result:"Переход в Documents", question:"Как перейти в директорию Documents?", options:["ls Documents","pwd Documents","cd Documents","mkdir Documents"], correct:"cd Documents" },
  { command:"mkdir", meaning:"Создаёт новую директорию.", when:"Когда нужно создать папку для файлов или проекта.", example:"mkdir practice", result:"Создана директория practice", question:"Как создать директорию practice?", options:["touch practice","mkdir practice","cd practice","ls practice"], correct:"mkdir practice" },
  { command:"touch", meaning:"Создаёт пустой файл, если его ещё нет. Если файл существует, обновляет время изменения.", when:"Когда нужно быстро создать новый пустой файл.", example:"touch notes.txt", result:"Создан файл notes.txt", question:"Как создать пустой файл notes.txt?", options:["mkdir notes.txt","touch notes.txt","cd notes.txt","pwd notes.txt"], correct:"touch notes.txt" },
  { command:"cp", meaning:"Копирует файлы и директории.", when:"Когда нужно создать копию файла, сохранив оригинал.", example:"cp notes.txt backup.txt", result:"Создана копия backup.txt", question:"Как скопировать notes.txt в backup.txt?", options:["mv notes.txt backup.txt","rm notes.txt","cp notes.txt backup.txt","cat notes.txt"], correct:"cp notes.txt backup.txt" },
  { command:"mv", meaning:"Перемещает файлы и директории, а также используется для переименования.", when:"Когда нужно переместить файл или изменить его имя.", example:"mv old.txt new.txt", result:"Файл переименован в new.txt", question:"Как переименовать old.txt в new.txt?", options:["cp old.txt new.txt","mv old.txt new.txt","rm old.txt","touch new.txt"], correct:"mv old.txt new.txt" },
  { command:"cat", meaning:"Выводит содержимое файла в терминал.", when:"Когда нужно быстро прочитать небольшой текстовый файл.", example:"cat notes.txt", result:"Текст из notes.txt", question:"Как вывести содержимое notes.txt?", options:["cat notes.txt","pwd notes.txt","cd notes.txt","mkdir notes.txt"], correct:"cat notes.txt" },
  { command:"less", meaning:"Открывает файл для постраничного просмотра.", when:"Когда файл большой и его удобнее читать частями.", example:"less log.txt", result:"Файл открыт для просмотра; выход — клавиша q", question:"Как открыть log.txt для постраничного просмотра?", options:["less log.txt","touch log.txt","mv log.txt","pwd log.txt"], correct:"less log.txt" },
  { command:"head", meaning:"Показывает первые строки файла.", when:"Когда нужно быстро посмотреть начало файла.", example:"head notes.txt", result:"Первые 10 строк файла", question:"Как показать начало notes.txt?", options:["tail notes.txt","head notes.txt","cat -r notes.txt","cd notes.txt"], correct:"head notes.txt" },
  { command:"tail", meaning:"Показывает последние строки файла.", when:"Когда нужно посмотреть конец файла или последние записи журнала.", example:"tail app.log", result:"Последние 10 строк журнала", question:"Как показать конец app.log?", options:["head app.log","tail app.log","ls app.log","pwd app.log"], correct:"tail app.log" },
  { command:"grep", meaning:"Ищет строки, соответствующие заданному шаблону.", when:"Когда нужно найти слово или фразу в файле.", example:"grep error app.log", result:"Строки, содержащие error", question:"Как найти строки со словом error в app.log?", options:["grep error app.log","find error app.log","cd error app.log","mkdir error app.log"], correct:"grep error app.log" },
  { command:"find", meaning:"Ищет файлы и директории по заданным условиям.", when:"Когда нужно найти файл по имени или расположению.", example:"find . -name notes.txt", result:"Пути к найденным файлам notes.txt", question:"Как найти notes.txt начиная с текущей папки?", options:["find . -name notes.txt","grep notes.txt .","ls -name notes.txt","cd notes.txt"], correct:"find . -name notes.txt" },
  { command:"rm", meaning:"Удаляет файлы; удалённое обычно нельзя восстановить простой отменой.", when:"Когда нужно удалить ненужный файл. Перед запуском проверяй путь.", example:"rm old.txt", result:"Файл old.txt удалён", question:"Как удалить old.txt?", options:["rm old.txt","mv old.txt","cp old.txt","touch old.txt"], correct:"rm old.txt" },
  { command:"chmod", meaning:"Изменяет права доступа к файлу или директории.", when:"Когда нужно разрешить или запретить определённые действия с файлом.", example:"chmod +x script.sh", result:"Файл получил право на выполнение согласно текущим правам и umask.", question:"Как добавить право выполнения командой chmod?", options:["chmod +x script.sh","chown +x script.sh","mkdir +x script.sh","cat +x script.sh"], correct:"chmod +x script.sh" },
  { command:"whoami", meaning:"Показывает имя текущего пользователя.", when:"Когда нужно проверить, под каким пользователем выполняются команды.", example:"whoami", result:"Имя текущего пользователя", question:"Как узнать имя текущего пользователя?", options:["whoami","pwd","hostname","users -p"], correct:"whoami" },
  { command:"ps", meaning:"Показывает сведения о запущенных процессах.", when:"Когда нужно посмотреть процессы, работающие в системе.", example:"ps", result:"Список процессов текущего терминала", question:"Как посмотреть процессы?", options:["ps","pwd","ls","mkdir"], correct:"ps" },
  { command:"kill", meaning:"Отправляет сигнал процессу; часто используется для завершения процесса.", when:"Когда нужно остановить зависшую или ненужную программу.", example:"kill 1234", result:"Процессу с PID 1234 отправлен сигнал завершения", question:"Как отправить сигнал процессу с PID 1234?", options:["kill 1234","ps 1234","stop 1234","rm 1234"], correct:"kill 1234" },
  { command:"df", meaning:"Показывает использование дискового пространства файловыми системами.", when:"Когда нужно проверить, сколько места осталось на диске.", example:"df -h", result:"Использование дисков в удобных единицах", question:"Как посмотреть свободное место на дисках в удобном формате?", options:["du -h","df -h","ls -h","free -h"], correct:"df -h" },
  { command:"du", meaning:"Оценивает размер файлов и директорий.", when:"Когда нужно найти, какие папки занимают место.", example:"du -sh Downloads", result:"Общий размер папки Downloads", question:"Как узнать общий размер папки Downloads?", options:["df Downloads","du -sh Downloads","ls -sh Downloads","pwd Downloads"], correct:"du -sh Downloads" },
  { command:"uname", meaning:"Выводит сведения о системе и ядре.", when:"Когда нужно узнать тип системы или версию ядра.", example:"uname -a", result:"Сводная информация о системе", question:"Как вывести подробную информацию о системе?", options:["uname -a","whoami -a","ps -a","system -info"], correct:"uname -a" },
  { command:"ip", meaning:"Показывает и настраивает сетевые интерфейсы, адреса и маршруты.", when:"Когда нужно проверить сетевые интерфейсы и IP-адреса.", example:"ip addr", result:"Список интерфейсов и назначенных адресов", question:"Как посмотреть IP-адреса интерфейсов?", options:["ip addr","net addr","ifconfig showall","ping addr"], correct:"ip addr" },
  { command:"echo", meaning:"Выводит текст или значение переменной в терминал.", when:"Когда нужно вывести сообщение или проверить значение.", example:"echo Hello", result:"Hello", question:"Как вывести слово Hello?", options:["echo Hello","cat Hello","print Hello","show Hello"], correct:"echo Hello" },
  { command:"date", meaning:"Показывает текущие дату и время.", when:"Когда нужно узнать системное время.", example:"date", result:"Текущие дата и время", question:"Как показать дату и время?", options:["time","date","clock -show","now"], correct:"date" },
  { command:"clear", meaning:"Очищает видимую область терминала.", when:"Когда нужно убрать старый вывод с экрана.", example:"clear", result:"Чистый экран терминала", question:"Как очистить экран терминала?", options:["clear","clean","reset-screen","erase"], correct:"clear" },
  { command:"history", meaning:"Показывает историю команд текущей оболочки.", when:"Когда нужно найти ранее введённую команду.", example:"history", result:"Список ранее выполненных команд", question:"Как посмотреть историю команд?", options:["history","logcmd","past","commands -old"], correct:"history" },
  { command:"which", meaning:"Показывает путь к исполняемому файлу команды, найденному через PATH.", when:"Когда нужно узнать, какая программа запускается командой.", example:"which python", result:"Путь к найденному исполняемому файлу", question:"Как узнать путь к программе python через PATH?", options:["which python","where python","find python","path python"], correct:"which python" },
  { command:"printf", meaning:"Форматированно выводит текст и значения.", when:"Когда нужен управляемый формат вывода.", example:"printf 'Hello %s\\n' Linux", result:"Hello Linux", question:"Для чего нужна команда printf?", options:["printf","ls","pwd","cat"], correct:"printf" },
  { command:"nano", meaning:"Открывает простой консольный текстовый редактор.", when:"Когда нужно быстро изменить текстовый файл в терминале.", example:"nano notes.txt", result:"Открыт файл notes.txt в nano", question:"Для чего нужна команда nano?", options:["nano","cat","grep","less"], correct:"nano" },
  { command:"vim", meaning:"Открывает мощный консольный текстовый редактор.", when:"Когда нужно редактировать файлы прямо в терминале.", example:"vim config.txt", result:"Открыт config.txt в Vim", question:"Для чего нужна команда vim?", options:["vim","cp","mv","rm"], correct:"vim" },
  { command:"micro", meaning:"Открывает современный простой терминальный текстовый редактор.", when:"Когда нужен удобный редактор в терминале.", example:"micro notes.txt", result:"Открыт notes.txt в Micro", question:"Для чего нужна команда micro?", options:["micro","grep","find","sed"], correct:"micro" },
  { command:"file", meaning:"Определяет тип файла по его содержимому.", when:"Когда нужно понять, что находится в файле.", example:"file archive.tar", result:"archive.tar: POSIX tar archive", question:"Для чего нужна команда file?", options:["file","chmod","chown","chgrp"], correct:"file" },
  { command:"stat", meaning:"Показывает подробные метаданные файла или директории.", when:"Когда нужны размеры, права, даты и другие метаданные.", example:"stat notes.txt", result:"Подробные метаданные notes.txt", question:"Для чего нужна команда stat?", options:["stat","ps","top","jobs"], correct:"stat" },
  { command:"ln", meaning:"Создаёт ссылки на файлы.", when:"Когда нужно создать жёсткую или символическую ссылку.", example:"ln -s /var/log/app.log app.log", result:"Создана символическая ссылка app.log", question:"Для чего нужна команда ln?", options:["ln","df","du","free"], correct:"ln" },
  { command:"readlink", meaning:"Показывает, куда указывает символическая ссылка.", when:"Когда нужно проверить цель symlink.", example:"readlink app.log", result:"/var/log/app.log", question:"Для чего нужна команда readlink?", options:["readlink","ip","ss","ping"], correct:"readlink" },
  { command:"realpath", meaning:"Показывает абсолютный канонический путь.", when:"Когда нужен полный путь к файлу.", example:"realpath notes.txt", result:"/home/user/notes.txt", question:"Для чего нужна команда realpath?", options:["realpath","echo","printf","cat"], correct:"realpath" },
  { command:"basename", meaning:"Извлекает имя файла из пути.", when:"Когда нужно получить только имя последнего элемента пути.", example:"basename /home/user/notes.txt", result:"notes.txt", question:"Для чего нужна команда basename?", options:["basename","date","time","uptime"], correct:"basename" },
  { command:"dirname", meaning:"Извлекает директорию из пути.", when:"Когда нужно получить родительский путь.", example:"dirname /home/user/notes.txt", result:"/home/user", question:"Для чего нужна команда dirname?", options:["dirname","tar","zip","gzip"], correct:"dirname" },
  { command:"tree", meaning:"Показывает дерево файлов и директорий.", when:"Когда нужно быстро увидеть структуру проекта.", example:"tree project", result:"Дерево project", question:"Для чего нужна команда tree?", options:["tree","ssh","scp","sftp"], correct:"tree" },
  { command:"locate", meaning:"Ищет файлы по заранее созданной базе имён.", when:"Когда нужно быстро найти файл по имени.", example:"locate notes.txt", result:"Список совпадений", question:"Для чего нужна команда locate?", options:["locate","ls","pwd","cat"], correct:"locate" },
  { command:"xargs", meaning:"Передаёт элементы стандартного ввода другой команде как аргументы.", when:"Когда нужно обработать много результатов другой команды.", example:"find . -name '*.log' -print0 | xargs -0 rm", result:"Найденные .log переданы rm", question:"Для чего нужна команда xargs?", options:["xargs","cat","grep","less"], correct:"xargs" },
  { command:"sort", meaning:"Сортирует строки.", when:"Когда нужно упорядочить текстовый вывод.", example:"sort names.txt", result:"Отсортированные строки", question:"Для чего нужна команда sort?", options:["sort","cp","mv","rm"], correct:"sort" },
  { command:"uniq", meaning:"Удаляет соседние повторяющиеся строки.", when:"Когда нужно убрать дубликаты после сортировки.", example:"sort names.txt | uniq", result:"Уникальные строки", question:"Для чего нужна команда uniq?", options:["uniq","grep","find","sed"], correct:"uniq" },
  { command:"wc", meaning:"Считает строки, слова и байты.", when:"Когда нужно быстро посчитать объём текста.", example:"wc -l notes.txt", result:"Количество строк", question:"Для чего нужна команда wc?", options:["wc","chmod","chown","chgrp"], correct:"wc" },
  { command:"cut", meaning:"Выбирает части строк по позициям или разделителю.", when:"Когда нужно извлечь столбец из текста.", example:"cut -d: -f1 /etc/passwd", result:"Имена пользователей", question:"Для чего нужна команда cut?", options:["cut","ps","top","jobs"], correct:"cut" },
  { command:"tr", meaning:"Заменяет или удаляет символы во входном тексте.", when:"Когда нужно преобразовать символы в потоке.", example:"tr 'a-z' 'A-Z'", result:"Текст в верхнем регистре", question:"Для чего нужна команда tr?", options:["tr","df","du","free"], correct:"tr" },
  { command:"sed", meaning:"Обрабатывает и преобразует текстовый поток.", when:"Когда нужно массово заменить или удалить текст.", example:"sed 's/foo/bar/g' notes.txt", result:"Строки с заменой foo на bar", question:"Для чего нужна команда sed?", options:["sed","ip","ss","ping"], correct:"sed" },
  { command:"awk", meaning:"Обрабатывает текст по полям и условиям.", when:"Когда нужно извлечь или посчитать данные из таблиц.", example:"awk '{print $1}' data.txt", result:"Первое поле каждой строки", question:"Для чего нужна команда awk?", options:["awk","echo","printf","cat"], correct:"awk" },
  { command:"diff", meaning:"Показывает различия между файлами.", when:"Когда нужно сравнить две версии файла.", example:"diff old.txt new.txt", result:"Различия между файлами", question:"Для чего нужна команда diff?", options:["diff","date","time","uptime"], correct:"diff" },
  { command:"cmp", meaning:"Сравнивает файлы побайтно.", when:"Когда нужно проверить, одинаковы ли два файла.", example:"cmp file1 file2", result:"Результат побайтного сравнения", question:"Для чего нужна команда cmp?", options:["cmp","tar","zip","gzip"], correct:"cmp" },
  { command:"patch", meaning:"Применяет файл с изменениями к исходному файлу.", when:"Когда нужно применить подготовленный diff.", example:"patch < changes.patch", result:"Изменения применены", question:"Для чего нужна команда patch?", options:["patch","ssh","scp","sftp"], correct:"patch" },
  { command:"tar", meaning:"Создаёт и распаковывает tar-архивы.", when:"Когда нужно собрать несколько файлов в один архив.", example:"tar -cf backup.tar project/", result:"Создан backup.tar", question:"Для чего нужна команда tar?", options:["tar","ls","pwd","cat"], correct:"tar" },
  { command:"gzip", meaning:"Сжимает данные в формате gzip.", when:"Когда нужно уменьшить размер файла.", example:"gzip log.txt", result:"Создан log.txt.gz", question:"Для чего нужна команда gzip?", options:["gzip","cat","grep","less"], correct:"gzip" },
  { command:"gunzip", meaning:"Распаковывает gzip-файл.", when:"Когда нужно получить исходный файл из .gz.", example:"gunzip log.txt.gz", result:"Распакован log.txt", question:"Для чего нужна команда gunzip?", options:["gunzip","cp","mv","rm"], correct:"gunzip" },
  { command:"zip", meaning:"Создаёт ZIP-архив.", when:"Когда нужен распространённый архивный формат.", example:"zip -r project.zip project/", result:"Создан project.zip", question:"Для чего нужна команда zip?", options:["zip","grep","find","sed"], correct:"zip" },
  { command:"unzip", meaning:"Распаковывает ZIP-архив.", when:"Когда нужно извлечь содержимое ZIP.", example:"unzip project.zip", result:"Файлы распакованы", question:"Для чего нужна команда unzip?", options:["unzip","chmod","chown","chgrp"], correct:"unzip" },
  { command:"ssh", meaning:"Подключается к удалённому компьютеру по SSH.", when:"Когда нужно работать с удалённым Linux-сервером.", example:"ssh user@server", result:"Открыта SSH-сессия", question:"Для чего нужна команда ssh?", options:["ssh","ps","top","jobs"], correct:"ssh" },
  { command:"scp", meaning:"Копирует файлы между компьютерами через SSH.", when:"Когда нужно безопасно передать файл на сервер или обратно.", example:"scp notes.txt user@server:/tmp/", result:"Файл скопирован на сервер", question:"Для чего нужна команда scp?", options:["scp","df","du","free"], correct:"scp" },
  { command:"sftp", meaning:"Передаёт файлы через интерактивную SSH-сессию.", when:"Когда нужно управлять файлами на удалённом сервере.", example:"sftp user@server", result:"Открыта SFTP-сессия", question:"Для чего нужна команда sftp?", options:["sftp","ip","ss","ping"], correct:"sftp" },
  { command:"ping", meaning:"Проверяет доступность узла по сети.", when:"Когда нужно проверить сетевое соединение.", example:"ping -c 4 example.com", result:"Ответы от example.com", question:"Для чего нужна команда ping?", options:["ping","echo","printf","cat"], correct:"ping" },
  { command:"curl", meaning:"Передаёт данные по URL и поддерживает разные сетевые протоколы.", when:"Когда нужно получить веб-ресурс или вызвать HTTP API.", example:"curl https://example.com", result:"Ответ сервера", question:"Для чего нужна команда curl?", options:["curl","date","time","uptime"], correct:"curl" },
  { command:"wget", meaning:"Загружает файлы по HTTP, HTTPS и другим протоколам.", when:"Когда нужно скачать файл из сети.", example:"wget https://example.com/file.zip", result:"Файл скачан", question:"Для чего нужна команда wget?", options:["wget","tar","zip","gzip"], correct:"wget" },
  { command:"ss", meaning:"Показывает сетевые сокеты и соединения.", when:"Когда нужно посмотреть открытые сетевые соединения.", example:"ss -tulpn", result:"Список слушающих сокетов", question:"Для чего нужна команда ss?", options:["ss","ssh","scp","sftp"], correct:"ss" },
  { command:"dig", meaning:"Запрашивает DNS-информацию.", when:"Когда нужно проверить DNS-запись домена.", example:"dig example.com", result:"DNS-ответ", question:"Для чего нужна команда dig?", options:["dig","ls","pwd","cat"], correct:"dig" },
  { command:"host", meaning:"Выполняет простой DNS-поиск.", when:"Когда нужно быстро узнать IP или DNS-информацию.", example:"host example.com", result:"DNS-результат", question:"Для чего нужна команда host?", options:["host","cat","grep","less"], correct:"host" },
  { command:"traceroute", meaning:"Показывает маршрут пакетов до узла.", when:"Когда нужно понять, где возникают сетевые задержки.", example:"traceroute example.com", result:"Маршрут до узла", question:"Для чего нужна команда traceroute?", options:["traceroute","cp","mv","rm"], correct:"traceroute" },
  { command:"hostname", meaning:"Показывает или изменяет имя компьютера.", when:"Когда нужно узнать имя хоста.", example:"hostname", result:"Имя текущего компьютера", question:"Для чего нужна команда hostname?", options:["hostname","grep","find","sed"], correct:"hostname" },
  { command:"nmcli", meaning:"Управляет NetworkManager из командной строки.", when:"Когда нужно настроить или проверить сетевое подключение.", example:"nmcli device status", result:"Состояние сетевых устройств", question:"Для чего нужна команда nmcli?", options:["nmcli","chmod","chown","chgrp"], correct:"nmcli" },
  { command:"ip route", meaning:"Показывает и изменяет таблицу маршрутизации.", when:"Когда нужно проверить маршруты сети.", example:"ip route", result:"Таблица маршрутов", question:"Для чего нужна команда ip route?", options:["ip route","ps","top","jobs"], correct:"ip route" },
  { command:"free", meaning:"Показывает использование оперативной памяти.", when:"Когда нужно проверить RAM и swap.", example:"free -h", result:"Использование памяти", question:"Для чего нужна команда free?", options:["free","df","du"], correct:"free" },
  { command:"uptime", meaning:"Показывает время работы системы и среднюю нагрузку.", when:"Когда нужно узнать, сколько работает система.", example:"uptime", result:"Время работы и load average", question:"Для чего нужна команда uptime?", options:["uptime","ip","ss","ping"], correct:"uptime" },
  { command:"top", meaning:"Показывает процессы и нагрузку в реальном времени.", when:"Когда нужно наблюдать за CPU и памятью.", example:"top", result:"Интерактивный список процессов", question:"Для чего нужна команда top?", options:["top","echo","printf","cat"], correct:"top" },
  { command:"htop", meaning:"Показывает процессы в удобном интерактивном интерфейсе.", when:"Когда нужно удобно наблюдать и управлять процессами.", example:"htop", result:"Интерактивный монитор процессов", question:"Для чего нужна команда htop?", options:["htop","date","time","uptime"], correct:"htop" },
  { command:"pgrep", meaning:"Ищет PID процессов по имени или другим признакам.", when:"Когда нужно найти идентификатор процесса.", example:"pgrep nginx", result:"PID процессов nginx", question:"Для чего нужна команда pgrep?", options:["pgrep","tar","zip","gzip"], correct:"pgrep" },
  { command:"pkill", meaning:"Отправляет сигнал процессам, выбранным по имени.", when:"Когда нужно завершить процессы по имени.", example:"pkill nginx", result:"Сигнал отправлен процессам nginx", question:"Для чего нужна команда pkill?", options:["pkill","ssh","scp","sftp"], correct:"pkill" },
  { command:"jobs", meaning:"Показывает задания текущей оболочки.", when:"Когда нужно увидеть фоновые задания shell.", example:"jobs", result:"Список фоновых заданий", question:"Для чего нужна команда jobs?", options:["jobs","ls","pwd","cat"], correct:"jobs" },
  { command:"bg", meaning:"Продолжает остановленное задание в фоне.", when:"Когда нужно отправить job в background.", example:"bg %1", result:"Задание %1 продолжено в фоне", question:"Для чего нужна команда bg?", options:["bg","cat","grep","less"], correct:"bg" },
  { command:"fg", meaning:"Возвращает задание из фона на передний план.", when:"Когда нужно снова работать с background job.", example:"fg %1", result:"Задание %1 возвращено на передний план", question:"Для чего нужна команда fg?", options:["fg","cp","mv","rm"], correct:"fg" },
  { command:"nohup", meaning:"Запускает команду так, чтобы она продолжала работать после выхода из shell.", when:"Когда долгий процесс не должен зависеть от терминала.", example:"nohup ./backup.sh &", result:"Процесс запущен независимо от терминала", question:"Для чего нужна команда nohup?", options:["nohup","grep","find","sed"], correct:"nohup" },
  { command:"nice", meaning:"Запускает процесс с заданным приоритетом CPU.", when:"Когда нужно изменить приоритет нового процесса.", example:"nice -n 10 ./script.sh", result:"Скрипт запущен с изменённым приоритетом", question:"Для чего нужна команда nice?", options:["nice","chmod","chown","chgrp"], correct:"nice" },
  { command:"renice", meaning:"Изменяет приоритет уже работающего процесса.", when:"Когда нужно изменить CPU priority существующего процесса.", example:"renice 10 -p 1234", result:"Приоритет PID 1234 изменён", question:"Для чего нужна команда renice?", options:["renice","ps","top","jobs"], correct:"renice" },
  { command:"systemctl", meaning:"Управляет systemd-сервисами.", when:"Когда нужно запустить, остановить или проверить сервис.", example:"systemctl status nginx", result:"Статус nginx", question:"Для чего нужна команда systemctl?", options:["systemctl","df","du","free"], correct:"systemctl" },
  { command:"journalctl", meaning:"Показывает журналы systemd.", when:"Когда нужно искать события и ошибки сервисов.", example:"journalctl -u nginx", result:"Журнал nginx", question:"Для чего нужна команда journalctl?", options:["journalctl","ip","ss","ping"], correct:"journalctl" },
  { command:"dmesg", meaning:"Показывает сообщения ядра.", when:"Когда нужно исследовать события оборудования и ядра.", example:"dmesg | tail", result:"Последние сообщения ядра", question:"Для чего нужна команда dmesg?", options:["dmesg","echo","printf","cat"], correct:"dmesg" },
  { command:"lsblk", meaning:"Показывает блочные устройства и разделы.", when:"Когда нужно посмотреть диски и разделы.", example:"lsblk", result:"Список блочных устройств", question:"Для чего нужна команда lsblk?", options:["lsblk","date","time","uptime"], correct:"lsblk" },
  { command:"blkid", meaning:"Показывает UUID и типы файловых систем.", when:"Когда нужно узнать идентификаторы разделов.", example:"blkid", result:"UUID и типы файловых систем", question:"Для чего нужна команда blkid?", options:["blkid","tar","zip","gzip"], correct:"blkid" },
  { command:"mount", meaning:"Подключает файловую систему.", when:"Когда нужно смонтировать диск или файловую систему.", example:"mount /dev/sdb1 /mnt", result:"Файловая система смонтирована", question:"Для чего нужна команда mount?", options:["mount","ssh","scp","sftp"], correct:"mount" },
  { command:"umount", meaning:"Отключает смонтированную файловую систему.", when:"Когда нужно безопасно отсоединить файловую систему.", example:"umount /mnt", result:"Файловая система отключена", question:"Для чего нужна команда umount?", options:["umount","ls","pwd","cat"], correct:"umount" },
  { command:"fsck", meaning:"Проверяет и при необходимости исправляет файловую систему.", when:"Когда нужно проверить файловую систему офлайн.", example:"fsck /dev/sdb1", result:"Проверка файловой системы", question:"Для чего нужна команда fsck?", options:["fsck","cat","grep","less"], correct:"fsck" },
  { command:"fdisk", meaning:"Просматривает и изменяет таблицу разделов диска.", when:"Когда нужно управлять разделами с осторожностью.", example:"fdisk -l", result:"Список разделов", question:"Для чего нужна команда fdisk?", options:["fdisk","cp","mv","rm"], correct:"fdisk" },
  { command:"crontab", meaning:"Управляет заданиями планировщика cron пользователя.", when:"Когда нужно запускать команды по расписанию.", example:"crontab -e", result:"Открыт crontab пользователя", question:"Для чего нужна команда crontab?", options:["crontab","grep","find","sed"], correct:"crontab" },
  { command:"at", meaning:"Планирует выполнение команды один раз.", when:"Когда команду нужно выполнить в заданное время.", example:"echo 'backup.sh' | at 23:00", result:"Задание запланировано", question:"Для чего нужна команда at?", options:["at","chmod","chown","chgrp"], correct:"at" },
  { command:"env", meaning:"Показывает переменные окружения или запускает команду с ними.", when:"Когда нужно посмотреть окружение процесса.", example:"env", result:"Список переменных окружения", question:"Для чего нужна команда env?", options:["env","ps","top","jobs"], correct:"env" },
  { command:"printenv", meaning:"Показывает переменные окружения.", when:"Когда нужно посмотреть значение переменной окружения.", example:"printenv HOME", result:"Значение HOME", question:"Для чего нужна команда printenv?", options:["printenv","df","du","free"], correct:"printenv" },
  { command:"export", meaning:"Экспортирует переменную в окружение дочерних процессов.", when:"Когда переменная должна быть доступна запущенным из shell программам.", example:"export EDITOR=nano", result:"EDITOR экспортирован", question:"Для чего нужна команда export?", options:["export","ip","ss","ping"], correct:"export" },
  { command:"source", meaning:"Выполняет команды из файла в текущей оболочке.", when:"Когда нужно применить настройки shell без нового процесса.", example:"source ~/.bashrc", result:"Настройки shell загружены", question:"Для чего нужна команда source?", options:["source","echo","printf","cat"], correct:"source" },
  { command:"alias", meaning:"Создаёт сокращение для команды.", when:"Когда часто используемую длинную команду хочется заменить короткой.", example:"alias ll='ls -la'", result:"Создан alias ll", question:"Для чего нужна команда alias?", options:["alias","date","time","uptime"], correct:"alias" },
  { command:"unalias", meaning:"Удаляет alias.", when:"Когда нужно убрать ранее созданное сокращение.", example:"unalias ll", result:"Alias ll удалён", question:"Для чего нужна команда unalias?", options:["unalias","tar","zip","gzip"], correct:"unalias" },
  { command:"man", meaning:"Открывает справочную страницу команды.", when:"Когда нужно узнать официальное описание и параметры команды.", example:"man grep", result:"Открыта справка grep", question:"Для чего нужна команда man?", options:["man","ssh","scp","sftp"], correct:"man" },
  { command:"help", meaning:"Показывает встроенную справку shell-команд.", when:"Когда нужно узнать синтаксис встроенной команды Bash.", example:"help cd", result:"Справка по cd", question:"Для чего нужна команда help?", options:["help","ls","pwd","cat"], correct:"help" },
];

const categoryGroups = [
  ["📁 Файлы и директории", ["pwd","ls","cd","mkdir","touch","cp","mv","cat","less","head","tail","file","stat","ln","readlink","realpath","basename","dirname","tree"]],
  ["🔎 Поиск и текст", ["grep","find","locate","xargs","sort","uniq","wc","cut","tr","sed","awk","diff","cmp","patch"]],
  ["📦 Архивы", ["tar","gzip","gunzip","zip","unzip"]],
  ["🌐 Сеть", ["ip","ip route","ssh","scp","sftp","ping","curl","wget","ss","dig","host","traceroute","hostname","nmcli"]],
  ["⚙️ Процессы", ["ps","kill","top","htop","pgrep","pkill","jobs","bg","fg","nohup","nice","renice","systemctl","journalctl","dmesg","watch","timeout","time"]],
  ["💾 Диски", ["df","du","lsblk","blkid","mount","umount","fsck","fdisk"]],
  ["👤 Пользователи и права", ["whoami","chmod","sudo","su","chown","chgrp","passwd","id","groups","last"]],
  ["⌨️ Терминал и оболочка", ["echo","printf","date","clear","history","which","nano","vim","micro","env","printenv","export","source","alias","unalias","man","help","apropos","true","false","test","expr","seq","sleep","crontab","at"]],
];

const categories = categoryGroups.map(([name, names]) => ({
  name,
  ids: names.map(n => commands.findIndex(c => c.command === n)).filter(i => i >= 0),
  desc: `Практика: ${names.slice(0, 6).join(", ")}${names.length > 6 ? " и другие команды." : "."}`,
}));

export default function App() {
  const [savedSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lt_session") || "null") || {};
    } catch {
      return {};
    }
  });

  const [order, setOrder] = useState(
    Array.isArray(savedSession.order) &&
    savedSession.order.length > 0 &&
    savedSession.order.every(i => Number.isInteger(i) && i >= 0 && i < commands.length)
      ? savedSession.order
      : commands.map((_, i) => i)
  );

  const [page, setPage] = useState(savedSession.page || "home");
  const [mode, setMode] = useState(savedSession.mode || "learn");
  const [index, setIndex] = useState(
    Number.isInteger(savedSession.index)
      ? Math.min(commands.length - 1, Math.max(0, savedSession.index))
      : 0
  );

  const [answer, setAnswer] = useState(savedSession.answer || "");
  const [typed, setTyped] = useState(savedSession.typed || "");
  const [checked, setChecked] = useState(Boolean(savedSession.checked));
  const [parts, setParts] = useState([]);
  const [results, setResults] = useState(
    Array.isArray(savedSession.results) ? savedSession.results : []
  );
  const [completed, setCompleted] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lt_completed") || "[]");
    } catch {
      return [];
    }
  });

  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lt_user"));
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("lt_token") || "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({});

  const [streak, setStreak] = useState(() => {
    const saved = Number(localStorage.getItem("lt_streak") || 0);
    const lastDate = localStorage.getItem("lt_streak_date");
    if (!lastDate) return 0;

    const today = new Date();
    const last = new Date(`${lastDate}T00:00:00`);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diff = Math.floor((todayStart - last) / 86400000);

    if (diff > 1) {
      localStorage.setItem("lt_streak", "0");
      return 0;
    }
    return Math.max(0, saved);
  });
  const [reviewDue, setReviewDue] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lt_review_due") || "{}") || {};
    } catch {
      return {};
    }
  });

  const current = commands[order[index]] || commands[0];
  const done = completed.length;
  const percent = Math.round((done / commands.length) * 100);

  const headers = () => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  async function loadProgress(t = token) {
    if (!t) return;

    try {
      const r = await fetch(`${API}/api/progress`, {
        headers: { Authorization: `Bearer ${t}` },
      });

      if (!r.ok) return;

      const rows = await r.json();
      const map = {};

      rows.forEach(row => {
        map[row.command_name] = row;
      });

      setProgress(map);
      const learned = commands.filter(c => map[c.command]?.learned).map(c => c.command);
      setCompleted(learned);
      try {
        localStorage.setItem("lt_completed", JSON.stringify(learned));
      } catch {}
    } catch {
      setMessage("Не удалось подключиться к серверу.");
    }
  }

  useEffect(() => {
    if (token) loadProgress(token);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "lt_session",
        JSON.stringify({ page, mode, index, order, answer, typed, checked, results })
      );
    } catch {}
  }, [page, mode, index, order, answer, typed, checked, results]);

  async function auth(e) {
    e.preventDefault();
    setMessage("");
    setBusy(true);

    try {
      const r = await fetch(`${API}/api/${authMode}`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ username, password }),
      });

      const data = await r.json();

      if (!r.ok) throw new Error(data.message || "Ошибка авторизации");

      localStorage.setItem("lt_token", data.token);
      localStorage.setItem("lt_user", JSON.stringify(data.user));

      setToken(data.token);
      setUser(data.user);
      setPassword("");
      setMessage("");

      await loadProgress(data.token);
      setPage("home");
    } catch (err) {
      setMessage(err.message || "Сервер недоступен");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("lt_token");
    localStorage.removeItem("lt_user");
    localStorage.removeItem("lt_session");

    setToken("");
    setUser(null);
    setProgress({});
    setCompleted([]);
    setPage("home");
  }

  function start(m, selectedIds = null) {
    let pool = selectedIds || commands.map((_, i) => i);

    if (m === "review") {
      pool = commands
        .map((c, i) => ({ c, i }))
        .filter(({ c }) =>
          (reviewDue[c.command] || 0) > 0 &&
          (reviewDue[c.command] || 0) <= Date.now()
        )
        .map(({ i }) => i);

      if (!pool.length) {
        setMessage("Сейчас нет команд для повторения. Возвращайся после следующих занятий!");
        setPage("home");
        return;
      }
    }

    if (m === "exam") {
      const learnedIds = commands
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => progress[c.command]?.learned)
        .map(({ i }) => i);

      pool = learnedIds.length ? learnedIds : commands.map((_, i) => i);
    }

    const shuffled = [...pool].sort(() => Math.random() - 0.5);

    setMessage("");
    setOrder(shuffled);
    setMode(m);
    setIndex(0);
    setAnswer("");
    setTyped("");
    setParts([]);
    setChecked(false);
    setResults([]);
    setPage("lesson");
  }

  async function save(command, correct) {
    const schedule = {
      ...reviewDue,
      [command]: Date.now() + (correct ? 3 : 1) * 86400000,
    };

    setReviewDue(schedule);

    try {
      localStorage.setItem("lt_review_due", JSON.stringify(schedule));
    } catch {}

    if (!token) return;

    const old = progress[command] || {};

    const body = {
      command_name: command,
      learned: old.learned || false,
      correct_answers: (old.correct_answers || 0) + (correct ? 1 : 0),
      wrong_answers: (old.wrong_answers || 0) + (correct ? 0 : 1),
    };

    try {
      const r = await fetch(`${API}/api/progress`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
      });

      if (r.ok) {
        const row = await r.json();
        setProgress(p => ({ ...p, [command]: row }));
      }
    } catch {
      setMessage("Прогресс не удалось сохранить. Проверь, запущен ли сервер.");
    }
  }

  function markStudyDay() {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const last = localStorage.getItem("lt_streak_date");

    if (last === today) return;

    let nextStreak = 1;
    if (last) {
      const lastDate = new Date(`${last}T00:00:00`);
      const todayDate = new Date(`${today}T00:00:00`);
      const diff = Math.floor((todayDate - lastDate) / 86400000);
      nextStreak = diff === 1 ? streak + 1 : 1;
    }

    localStorage.setItem("lt_streak", String(nextStreak));
    localStorage.setItem("lt_streak_date", today);
    setStreak(nextStreak);
  }

  function checkAnswer() {
    if (checked || !current) return;

    const value =
      mode === "quiz" || mode === "review" || mode === "exam"
        ? answer.trim()
        : mode === "build"
          ? parts.join(" ").trim()
          : typed.trim();

    const correct = value === current.correct;

    setResults(old => [...old, correct]);
    setChecked(true);

    markStudyDay();
    save(current.command, correct);
  }

  function next() {
    if (mode === "learn") {
      markStudyDay();
      const nextDone = [...new Set([...completed, current.command])];
      setCompleted(nextDone);
      try {
        localStorage.setItem("lt_completed", JSON.stringify(nextDone));
      } catch {}
      try {
        localStorage.setItem("lt_completed", JSON.stringify(nextDone));
      } catch {}

      if (token) {
        const old = progress[current.command] || {};

        fetch(`${API}/api/progress`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            command_name: current.command,
            learned: true,
            correct_answers: old.correct_answers || 0,
            wrong_answers: old.wrong_answers || 0,
          }),
        })
          .then(r => r.ok ? r.json() : null)
          .then(row => {
            if (row) setProgress(p => ({ ...p, [current.command]: row }));
          })
          .catch(() => {});
      }
    }

    if (index < order.length - 1) {
      setIndex(index + 1);
      setAnswer("");
      setTyped("");
      setParts([]);
      setChecked(false);
    } else {
      setPage("result");
    }
  }

  const isCorrect =
    (mode === "quiz" || mode === "review" || mode === "exam"
      ? answer.trim()
      : mode === "build"
        ? parts.map(partIndex => current.correct.split(" ")[partIndex]).join(" ").trim()
        : typed.trim()) === current.correct;

  const dueCount = Object.values(reviewDue).filter(
    t => t > 0 && t <= Date.now()
  ).length;

  const dailyCommand = commands[Math.floor(Date.now() / 86400000) % commands.length];

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">🐧</div>
          <div>
            <h2>Linux<span>Trainer</span></h2>
            <p>LEARN BY DOING</p>
          </div>
        </div>

        <nav className="navigation">
          <button className={`nav-link ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>⌂ Главная</button>
          <button className="nav-link" onClick={() => start("learn")}>📚 Обучение</button>
          <button className="nav-link" onClick={() => setPage("categories")}>▦ Категории</button>
          <button className="nav-link" onClick={() => start("quiz")}>🧠 Тесты</button>
          <button className="nav-link" onClick={() => start("build")}>🧩 Конструктор</button>
          <button className="nav-link" onClick={() => setPage("stats")}>📊 Статистика</button>
        </nav>

        <div className="sidebar-bottom">
          <div className="terminal-card">
            <span className="terminal-icon">⌘</span>
            <p>Маленькие шаги —<br /> большие знания.</p>
            <span className="terminal-prompt">user@linux:~$ learn</span>
          </div>

          <div className="profile">
            <div className="avatar">🐱</div>
            <div>
              <strong>{user?.username || "Мой профиль"}</strong>
              <p>{user ? "Ты в системе" : "Будущий Linux pro"}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main">
        {page === "home" && (
          <>
            <header className="topbar">
              <div>
                <p className="eyebrow">ТВОЯ LINUX-ПРАКТИКА · 100 КОМАНД</p>
                <h1>Привет, {user?.username || "будущий Linux pro"}! 👋</h1>
                <p className="subtitle">100 Linux-команд, практика каждый день и повторение по расписанию.</p>
              </div>

              <div className="auth-actions">
                {user
                  ? <button className="secondary-button" onClick={logout}>Выйти</button>
                  : <button className="secondary-button" onClick={() => setPage("auth")}>Войти / Регистрация</button>}
              </div>
            </header>

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-top"><span className="stat-icon fire">🔥</span><span className="stat-label">ТВОЯ СЕРИЯ</span></div>
                <div className="stat-number">{streak} <span>дней</span></div>
                <p>{streak ? "Продолжай заниматься каждый день!" : "Ответь на задание, чтобы начать серию."}</p>
                <div className="mini-progress"><span /></div>
              </div>

              <div className="stat-card">
                <div className="stat-top"><span className="stat-icon book">📚</span><span className="stat-label">ИЗУЧЕНО</span></div>
                <div className="stat-number">{done} <span>команд</span></div>
                <p>Каждая команда — новый навык</p>
                <div className="mini-progress"><span style={{ width: `${percent}%` }} /></div>
              </div>

              <div className="stat-card">
                <div className="stat-top"><span className="stat-icon target">🎯</span><span className="stat-label">ЦЕЛЬ НА ДЕНЬ</span></div>
                <div className="stat-number">5 <span>команд</span></div>
                <p>Небольшая цель на сегодня</p>
                <div className="mini-progress"><span style={{ width: `${Math.min(100, done / 5 * 100)}%` }} /></div>
              </div>
            </section>

            <section className="daily-card">
              <div className="daily-content">
                <div className="daily-badge"><span className="pulse" /> ТВОЙ ПЛАН НА СЕГОДНЯ</div>
                <h2>Готова прокачать<br /> свои Linux-навыки?</h2>
                <p>Изучи новые команды, повтори старые и закрепи знания на практике.</p>
                <button className="primary-button" onClick={() => start("learn")}>Начать обучение <span>→</span></button>
              </div>

              <div className="daily-visual">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="linux-mascot">🐧</div>
                <div className="floating-code code-one">pwd</div>
                <div className="floating-code code-two">chmod</div>
                <div className="floating-code code-three">grep</div>
                <div className="visual-caption">LEVEL UP YOUR LINUX</div>
              </div>
            </section>

            <section className="daily-command-card">
              <p className="eyebrow">ПОВТОРЕНИЕ</p>
              <h2>{dueCount} команд пора повторить</h2>
              <p>После правильного ответа повтор назначается через 3 дня, после ошибки — через 1 день.</p>
              <button className="secondary-button" onClick={() => start("review")}>Начать повторение →</button>
            </section>

            <section className="daily-command-card">
              <p className="eyebrow">КОМАНДА ДНЯ</p>
              <h2>{dailyCommand.command}</h2>
              <p>{dailyCommand.meaning}</p>
              <code>{dailyCommand.example}</code>
              <button className="secondary-button" onClick={() => start("quiz")}>Проверить себя →</button>
            </section>

            <section className="task-grid">
              <div className="section-heading">
                <div><p className="eyebrow">ТВОЙ ПРОГРЕСС</p><h2>Сегодняшние задания</h2></div>
                <span className="today-tag">День 1</span>
              </div>

              {[
                ["✦", "Новые команды", "Изучи базовые Linux-команды", "learn"],
                ["↻", "Тест по командам", "Проверь, что запомнила", "quiz"],
                ["🏁", "Итоговый тест", "Проверка изученных команд", "exam"],
                ["⌨️", "Без вариантов", "Вспомни команды самостоятельно", "typing"],
                ["🧩", "Конструктор команд", "Собери команду из частей", "build"],
              ].map(([ic, title, desc, m]) => (
                <div className="task-card" key={m} onClick={() => start(m)}>
                  <div className="task-icon review-icon">{ic}</div>
                  <div className="task-info">
                    <h3>{title}</h3>
                    <p>{desc}</p>
                    <div className="task-progress">
                      <div><span style={{ width: m === "learn" ? `${percent}%` : "0%" }} /></div>
                      <small>{m === "learn" ? `${done} / ${commands.length}` : `${commands.length} заданий`}</small>
                    </div>
                  </div>
                  <span className="task-arrow">→</span>
                </div>
              ))}
            </section>
          </>
        )}

        {page === "auth" && (
          <section className="learning-page">
            <button className="back-button" onClick={() => setPage("home")}>← На главную</button>
            <div className="learning-card">
              <p className="eyebrow">ТВОЙ ПРОФИЛЬ</p>
              <h1>{authMode === "login" ? "Вход" : "Создать аккаунт"}</h1>

              <form onSubmit={auth}>
                <label>Имя пользователя</label>
                <input className="typing-input" value={username} onChange={e => setUsername(e.target.value)} minLength={3} maxLength={50} autoComplete="username" required />

                <label>Пароль</label>
                <input className="typing-input" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={authMode === "register" ? 8 : 1} autoComplete={authMode === "login" ? "current-password" : "new-password"} required />

                {message && <p className="feedback error">{message}</p>}

                <button className="primary-button" disabled={busy}>
                  {busy ? "Подожди…" : authMode === "login" ? "Войти →" : "Зарегистрироваться →"}
                </button>
              </form>

              <button className="secondary-button" onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setMessage("");
              }}>
                {authMode === "login" ? "Нет аккаунта? Зарегистрироваться" : "Уже есть аккаунт? Войти"}
              </button>
            </div>
          </section>
        )}

        {page === "lesson" && (
          <section className="learning-page">
            <button className="back-button" onClick={() => setPage("home")}>← На главную</button>
            <p className="eyebrow">
              {mode === "learn" ? "ИЗУЧЕНИЕ КОМАНД" : mode === "quiz" || mode === "exam" ? "ПРОВЕРКА ЗНАНИЙ" : mode === "build" ? "СОБЕРИ КОМАНДУ" : mode === "review" ? "ПОВТОРЕНИЕ ПРОСРОЧЕННЫХ" : "РЕЖИМ БЕЗ ВАРИАНТОВ"}
            </p>
            <h1>
              {mode === "learn" ? "Урок 1. Основы Linux" : mode === "quiz" ? "Тест по командам" : mode === "exam" ? "Итоговый тест" : mode === "build" ? "Конструктор команд" : mode === "review" ? "Повторение команд" : "Вспомни команду"}
            </h1>

            <div className="lesson-progress">
              <div><span style={{ width: `${((index + 1) / Math.max(order.length, 1)) * 100}%` }} /></div>
              <small>{index + 1} из {order.length}</small>
            </div>

            {current && (
              <div className="learning-card">
                <div className="command-label">{mode === "learn" ? "LINUX COMMAND" : `ЗАДАНИЕ ${index + 1} / ${order.length}`}</div>

                {mode === "learn" ? (
                  <>
                    <h2 className="command-title">{current.command}</h2>
                    <h3>Что делает команда?</h3>
                    <p>{current.meaning}</p>
                    <div className="example-box"><span>ПРИМЕР</span><code>{current.example}</code><p>{current.result}</p></div>
                    <div className="when-box"><strong>💡 Когда понадобится?</strong><p>{current.when}</p></div>
                    <button className="primary-button" onClick={next}>Запомнила, дальше →</button>
                    <button className="secondary-button" onClick={() => start("quiz")}>Перейти к тесту</button>
                    <button className="secondary-button" onClick={() => start("typing")}>⌨️ Без вариантов</button>
                  </>
                ) : (
                  <>
                    <h2>{current.question}</h2>

                    {mode === "quiz" || mode === "review" || mode === "exam" ? (
                      <div className="answer-options">
                        {[...current.options]
                          .sort((a, b) => ((a.length * 7 + order[index] * 13) % 17) - ((b.length * 7 + order[index] * 13) % 17))
                          .map(o => (
                            <button key={o} className={`answer-option ${answer === o ? "selected" : ""} ${checked && o === current.correct ? "correct" : ""} ${checked && answer === o && !isCorrect ? "wrong" : ""}`} disabled={checked} onClick={() => setAnswer(o)}>
                              {o}
                            </button>
                          ))}
                      </div>
                    ) : mode === "build" ? (
                      <>
                        <p>Собери команду для задания: нажимай части в правильном порядке.</p>
                        <div className="answer-options">
                          {parts.map((partIndex, i) => (
                            <button className="answer-option selected" key={`${partIndex}-${i}`} onClick={() => !checked && setParts(parts.filter((_, j) => j !== i))}>{current.correct.split(" ")[partIndex]} ×</button>
                          ))}
                        </div>
                        <div className="answer-options">
                          {current.correct.split(" ").map((part, i) => (
                            <button className="answer-option" key={i} disabled={checked || parts.includes(i)} onClick={() => setParts([...parts, i])}>{part}</button>
                          ))}
                        </div>
                        <button className="secondary-button" onClick={() => setParts([])} disabled={checked}>Очистить</button>
                      </>
                    ) : (
                      <>
                        <p>Вспомни команду и введи её самостоятельно.</p>
                        <input className="typing-input" value={typed} onChange={e => setTyped(e.target.value)} onKeyDown={e => e.key === "Enter" && typed.trim() && !checked && checkAnswer()} placeholder="Введи команду..." disabled={checked} autoComplete="off" spellCheck="false" />
                      </>
                    )}

                    {checked && (
                      <div className={`feedback ${isCorrect ? "success" : "error"}`}>
                        {isCorrect ? "✅ Правильно!" : `❌ Правильный ответ: ${current.correct}`}
                        <p>{current.meaning}</p>
                      </div>
                    )}

                    {!checked
                      ? <button className="primary-button" disabled={(mode === "quiz" || mode === "review" || mode === "exam") ? !answer : mode === "build" ? !parts.length : !typed.trim()} onClick={checkAnswer}>Проверить ответ →</button>
                      : <button className="primary-button" onClick={next}>{index === order.length - 1 ? "Посмотреть результат" : "Следующий вопрос →"}</button>}
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {page === "result" && (
          <section className="learning-card result-card">
            <div className="result-emoji">🎉</div>
            <p className="eyebrow">ЗАДАНИЯ ЗАВЕРШЕНЫ</p>
            <h1>Ты молодец!</h1>
            <p>Правильных ответов: {results.filter(Boolean).length} из {results.length}.</p>
            <button className="primary-button" onClick={() => setPage("home")}>На главную →</button>
            <button className="secondary-button" onClick={() => start("exam")}>Пройти итоговый тест ещё раз</button>
          </section>
        )}

        {page === "categories" && (
          <section className="learning-page">
            <p className="eyebrow">ИЗУЧАЙ ПО ТЕМАМ</p>
            <h1>100 Linux-команд по категориям</h1>
            <div className="categories-grid">
              {categories.map(cat => (
                <div className="category-card" key={cat.name}>
                  <h3>{cat.name}</h3>
                  <p>{cat.desc}</p>
                  <button className="secondary-button" onClick={() => start("learn", cat.ids)}>Начать →</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {page === "stats" && (
          <section className="learning-page">
            <p className="eyebrow">ТВОЙ ПРОГРЕСС</p>
            <h1>Статистика</h1>
            <div className="learning-card">
              <h2>{done} из {commands.length} команд изучено</h2>
              <p>Верных ответов: {Object.values(progress).reduce((s, x) => s + (x.correct_answers || 0), 0)}</p>
              <p>Ошибок: {Object.values(progress).reduce((s, x) => s + (x.wrong_answers || 0), 0)}</p>
              <div className="lesson-progress"><div><span style={{ width: `${percent}%` }} /></div></div>
              {!user && <p>Войди в аккаунт, чтобы сохранять прогресс между устройствами.</p>}
            </div>
          </section>
        )}

        {message && page !== "auth" && <p className="feedback error">{message}</p>}
      </main>
    </div>
  );
}