# Mock celery app to replace actual Celery for simplified synchronous execution
class MockCeleryApp:
    def task(self, *args, **kwargs):
        bind = kwargs.get('bind', False)
        def decorator(func):
            def delay(*a, **kw):
                # Execute synchronously
                if bind:
                    class DummyTask:
                        def retry(self, exc=None):
                            raise exc if exc else Exception("Task Retry")
                    return func(DummyTask(), *a, **kw)
                return func(*a, **kw)
            func.delay = delay
            return func
        return decorator

celery_app = MockCeleryApp()
