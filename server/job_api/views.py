from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import JobPosting
from .serializers import JobPostingSerializer
from job_scraper.services.scraper import scrape_job_posting
from job_scraper.services.ollama_processor import process_job_data

# Create your views here.

class JobPostingViewSet(viewsets.ModelViewSet):
    queryset = JobPosting.objects.all()
    serializer_class = JobPostingSerializer

    @action(detail=False, methods=['post'])
    def scrape(self, request):
        url = request.data.get('url')
        if not url:
            return Response({"error": "URL is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Check if job already exists
            existing_job = JobPosting.objects.filter(url=url).first()
            if existing_job:
                serializer = self.get_serializer(existing_job)
                return Response(serializer.data)

            # Scrape job posting
            raw_data = scrape_job_posting(url)

            # Process with Ollama
            processed_data = process_job_data(raw_data)

            # Add URL to processed data
            processed_data['url'] = url

            # Create job posting
            serializer = self.get_serializer(data=processed_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
