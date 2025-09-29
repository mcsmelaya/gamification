const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'students.json');

app.use(express.static('public'));
app.use(express.json());

const studentApi = 'localhost:2765'
const graph_controller_api = 'localhost:2766'

function processAchievements(apiResponse) {
  const result = {};

  const courses = apiResponse?.courses;
  if (!courses) return result;

  const informatics = courses.informatics;
  if (!informatics) return result;

  const tracks = informatics.tracks;
  if (!tracks) return result;

  for (const trackName in tracks) {
    const track = tracks[trackName];
    const achievements = {};

    const attended = track.attended_classes || 0;
    const total = track.all_classes || 0;
    const labs = track.labs || [];
    const tests = track.tests || [];

    // 3.1: Первое появление
    if (attended > 0) {
      achievements["Первое появление"] = true;
    }

    // 3.2: Уверенный слушатель (посещений > половины)
    if (total > 0 && attended > total / 2) {
      achievements["Уверенный слушатель"] = true;
    }

    // 3.3: Образцовый студент (посещены все занятия)
    if (attended === total && total > 0) {
      achievements["Образцовый студент"] = true;
    }

    // 3.4: Лабораторные — добавляем оценку по правилу
    const onTimeLabs = [];
    for (const lab of labs) {
      const issueDate = new Date(lab.issue_date.split('.').reverse().join('-'));
      const deadlineDate = new Date(lab.deadline_date.split('.').reverse().join('-'));
      const completeDate = new Date(lab.complete_date.split('.').reverse().join('-'));

      // Определяем балл
      let score = 1; // по умолчанию 1, если просрочено
      if (completeDate <= deadlineDate) {
        score = lab.grade;
        onTimeLabs.push(lab); // считаем, что сдана в срок
      }

      // Добавляем лабу как ачивку с баллом
      achievements[lab.name] = score;
    }

    const totalLabs = labs.length;
    const onTimeCount = onTimeLabs.length;

    // 3.5: Ачивки за лабы
    if (onTimeCount > 0) {
      achievements["Первый опыт лаб"] = true;
    }
    if (totalLabs > 0 && onTimeCount > totalLabs / 2) {
      achievements["Полпути пройдено"] = true;
    }
    if (onTimeCount === totalLabs && totalLabs > 0) {
      achievements["Лабораторный ветеран"] = true;
    }

    // 3.6: Ачивки за тесты (контрольные)
    // Предполагаем, что тесты идут по порядку: первый, второй, третий
    if (tests.length >= 1) {
      const firstTest = tests[0];
      const firstDateStr = Object.keys(firstTest.attempts)[0];
      const firstGrade = firstTest.attempts[firstDateStr];

      // "Азбука Теории" — сдана с первого раза (дата попытки = дата теста)
      const firstTestDate = new Date(firstTest.date.split('.').reverse().join('-'));
      const firstAttemptDate = new Date(firstDateStr.split('.').reverse().join('-'));

      if (firstAttemptDate.getTime() === firstTestDate.getTime() && firstGrade > 0) {
        achievements["Азбука Теории"] = true;
      }
    }

    if (tests.length >= 2) {
      const secondTest = tests[1];
      const secondDateStr = Object.keys(secondTest.attempts)[0];
      const secondGrade = secondTest.attempts[secondDateStr];

      const secondTestDate = new Date(secondTest.date.split('.').reverse().join('-'));
      const secondAttemptDate = new Date(secondDateStr.split('.').reverse().join('-'));

      if (secondAttemptDate.getTime() === secondTestDate.getTime() && secondGrade > 0) {
        achievements["Первый опыт контрольной"] = true;
      }
    }

    if (tests.length >= 3) {
      const thirdTest = tests[2];
      const thirdDateStr = Object.keys(thirdTest.attempts)[0];
      const thirdGrade = thirdTest.attempts[thirdDateStr];

      const thirdTestDate = new Date(thirdTest.date.split('.').reverse().join('-'));
      const thirdAttemptDate = new Date(thirdDateStr.split('.').reverse().join('-'));

      if (thirdAttemptDate.getTime() === thirdTestDate.getTime() && thirdGrade > 0) {
        achievements["Полпути к сдаче пройдено"] = true;
      }
    }

    // Сохраняем достижения для этого трека
    result[trackName] = achievements;
  }

  return result;
}


let studentIds = [];
if (fs.existsSync(DATA_FILE)) {
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  studentIds = JSON.parse(data);
}

// TODO: добавить логирование
app.post('/submit', async (req, res) => {
  const { id } = req.body;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Некорректный ID студента.' });
  }

  studentIds.push(id);

  fs.writeFileSync(DATA_FILE, JSON.stringify(studentIds, null, 2));

  console.log(`Сохранён ID студента: ${id}`);

  let studentData = null;
  try {
    const apiUrl = `http://${studentApi}/api/v1/students/info/${id}/`; // api для данных о студенте
    const response = await fetch(apiUrl);

    if (response.ok) {
      studentData = await response.json(); // получаем инфу о студенте

      console.log('\n==============> Получаем данные о студенте...')
      console.log(`Данные с API для ID ${id}:`, JSON.stringify(studentData, null, 2));
      console.log('==============>\n')


      if (!studentData) {
        return res.json({
          message: "Данные не получены",
          student: null,
          achievements: null
        });
      }

    } else {
      console.warn(`API вернул статус ${response.status} для ID ${id}`);
      console.log(`Ответ:`, await response.text());
    }
  } catch (error) {
    console.error(`Ошибка при запросе к API для ID ${id}:`, error.message);
  }

  // обрабатываем полученные данные
  const achs = processAchievements(studentData);

  console.log('\n==============> Обрабатываем...')
  console.log(`Обработанные данные:`, JSON.stringify(achs, null, 2));
  console.log('==============>\n')

  // TODO: add api url
  try {
    await fetch(`http://${graph_controller_api}/api/v1/students/update/${id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(achs)
    }); // делаем POST запрос для обновления
  } catch (error) {
    console.error('Не удалось отправить очивки')
  }

  res.json({ message: `ID ${id} успешно сохранён!` });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/list', (req, res) => {
  const data = JSON.parse(readFileSync(DATA_FILE));
  res.json(data);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен на http://<ваш_IP>:${PORT}`);
});