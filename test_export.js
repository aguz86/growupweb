const localStorage = {
  "productivity_user_2026-07-01": "{\"foo\":true}",
  "custom_schedule_user_2026-07-01": "[{\"id\":\"1\"}]",
  "globalOverrides_user": "{\"id1\":{}}"
};

const data = localStorage;

for (const key in data) {
    let dateMatch = key.match(/\d{4}-\d{2}-\d{2}$/);
    console.log(key, "=>", dateMatch);
}
