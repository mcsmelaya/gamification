const express = require('express');
const app = express();
const PORT = 2765;

// Пример данных о студентах
const students = {
  9: {
    "id": 9,
    "name": "Roman",
    "surname": "Kasimov",
    "group": "B22-515",
    "courses": {
      "informatics": {
        "id": 3,
        "tracks": {
          "aisd": {
            "attended_classes": 10,
            "all_classes": 16,
            "labs": [
              {
                "name": "List",
                "issue_date": "01.09.2020",
                "deadline_date": "14.09.2020",
                "complete_date": "10.09.2020",
                "grade": 4
              },
              {
                "name": "Queue",
                "issue_date": "14.09.2020",
                "deadline_date": "28.09.2020",
                "complete_date": "15.09.2020",
                "grade": 3
              },
              {
                "name": "Vector",
                "issue_date": "28.09.2020",
                "deadline_date": "12.10.2020",
                "complete_date": "15.08.2020",
                "grade": 5
              },
              {
                "name": "Matrix",
                "issue_date": "12.10.2020",
                "deadline_date": "26.10.2020",
                "complete_date": "20.10.2020",
                "grade": 5
              },
              {
                "name": "HashMap",
                "issue_date": "26.10.2020",
                "deadline_date": "09.11.2020",
                "complete_date": "01.11.2020",
                "grade": 4
              },
              {
                "name": "Recursion",
                "issue_date": "09.11.2020",
                "deadline_date": "23.11.2020",
                "complete_date": "15.11.2020",
                "grade": 3
              },
              {
                "name": "Sort",
                "issue_date": "23.11.2020",
                "deadline_date": "07.12.2020",
                "complete_date": "18.12.2020",
                "grade": 3
              },
              {
                "name": "Function",
                "issue_date": "07.12.2020",
                "deadline_date": "21.12.2020",
                "complete_date": "20.12.2020",
                "grade": 3
              }
            ],
            "tests": [
              {
                "date": "07.09.2020",
                "attempts": {
                  "07.09.2020": 0,
                  "8.10.2020": 4
                }
              },
              {
                "date": "17.10.2020",
                "attempts": {
                  "17.10.2020": 5
                }
              },
              {
                "date": "24.12.2020",
                "attempts": {
                  "24.12.2020": 3,
                }
              }
            ]
          },
          "metatheory": {
          },
          "polymorphic": {
          }
        }
      }
    }
  }
};

// TODO: добавить логирование
app.get('/api/v1/students/info/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (!id || !students[id]) {
    return res.status(404).json({ error: "Студент не найден" });
  }

  res.json(students[id]); // возвращаем инфоомацию о студенте
});

app.listen(PORT, 'localhost', () => {
  console.log(`API запущено на http://localhost:${PORT}`);
  console.log(`GET http://localhost:${PORT}/api/v1/students/info/1`);
});