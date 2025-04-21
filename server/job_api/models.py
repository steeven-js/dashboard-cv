from django.db import models

# Create your models here.

class JobPosting(models.Model):
    url = models.URLField(unique=True)
    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    skills = models.JSONField(default=list, blank=True, null=True)
    salary = models.CharField(max_length=255, blank=True, null=True)
    employment_type = models.CharField(max_length=100, blank=True, null=True)
    date_posted = models.DateField(blank=True, null=True)
    date_scraped = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='active')

    class Meta:
        ordering = ['-date_scraped']

    def __str__(self):
        return f"{self.title} at {self.company}"
