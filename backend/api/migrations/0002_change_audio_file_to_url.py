# Generated by Django 5.2.3 on 2025-07-02 23:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='frequency',
            name='audio_file',
        ),
        migrations.AddField(
            model_name='frequency',
            name='audio_url',
            field=models.URLField(blank=True, help_text="Frekansın ses dosyası URL'i (ör. YouTube, SoundCloud, CDN)", null=True),
        ),
    ]
