from django.db import migrations, models


def seed_skill_fields(apps, schema_editor):
    SkillField = apps.get_model("users", "SkillField")
    try:
        from users.courses_data import COURSES
    except Exception:
        COURSES = []
    for name in COURSES:
        v = (name or "").strip()
        if v:
            SkillField.objects.get_or_create(name=v)


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0004_add_profile_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="SkillField",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150, unique=True)),
            ],
        ),
        migrations.AddField(
            model_name="skill",
            name="fields",
            field=models.ManyToManyField(blank=True, related_name="skills", to="users.skillfield"),
        ),
        migrations.RunPython(seed_skill_fields, migrations.RunPython.noop),
    ]
