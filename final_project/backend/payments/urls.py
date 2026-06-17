from django.urls import path
from .views import (
    SubmitPaymentRequestView,
    MyPaymentRequestView,
    MyCourseAccessView,
    PaymentStatusView,
)

urlpatterns = [
    # Student submits course selection for review
    path("request/",    SubmitPaymentRequestView.as_view(), name="payment-request-create"),
    # Student checks their latest request status
    path("my-request/", MyPaymentRequestView.as_view(),    name="payment-request-detail"),
    # Student views their unlocked courses
    path("my-access/",  MyCourseAccessView.as_view(),      name="course-access-list"),
    # Dashboard summary (pending/approved/rejected + count)
    path("status/",     PaymentStatusView.as_view(),        name="payment-status"),
]
