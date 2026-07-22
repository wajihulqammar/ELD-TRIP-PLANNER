from django.contrib import admin
from django.urls import path, include
from hos_api.views import health_check

urlpatterns = [
    path('', health_check, name='root_health_check'),
    path('admin/', admin.site.urls),
    path('api/', include('hos_api.urls')),
]
