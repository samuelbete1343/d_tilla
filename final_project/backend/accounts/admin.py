from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ('email', 'full_name', 'program', 'is_active', 'is_staff', 'date_joined')
    list_filter   = ('is_active', 'is_staff', 'program', 'gender')
    search_fields = ('email', 'full_name', 'phone')
    ordering      = ('-date_joined',)
    readonly_fields = ('date_joined', 'last_login')

    fieldsets = (
        (None,           {'fields': ('email', 'password')}),
        ('Profile',      {'fields': ('full_name', 'phone', 'gender', 'program')}),
        ('Permissions',  {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Timestamps',   {'fields': ('date_joined', 'last_login'), 'classes': ('collapse',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields':  ('email', 'full_name', 'password1', 'password2'),
        }),
    )
