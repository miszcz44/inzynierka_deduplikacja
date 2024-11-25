FROM python:3.11-slim

WORKDIR /home/jupyter

# Install dependencies
COPY ../app/requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt
RUN pip install jupyter

# Disable token and password authentication
RUN jupyter notebook --generate-config && \
    echo "c.IdentityProvider.token = ''" >> /root/.jupyter/jupyter_server_config.py && \
    echo "c.ServerApp.password = ''" >> /root/.jupyter/jupyter_server_config.py && \
    echo "c.ServerApp.ip = '*'" >> /root/.jupyter/jupyter_server_config.py && \
    echo "c.ServerApp.open_browser = False" >> /root/.jupyter/jupyter_server_config.py

EXPOSE 8888

CMD ["jupyter", "notebook", "--ip=0.0.0.0", "--allow-root", "--no-browser", "--notebook-dir=/home/jupyter"]


