<script setup lang="ts">
import { ref } from 'vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';

const usernameTouched = ref<boolean>(false);
const emailTouched = ref<boolean>(false);

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const router = useRouter();

const schema = yup.object({
  first_name: yup.string().required('obrigatório'),
  last_name: yup.string().required('obrigatório'),
  username: yup.string().required('obrigatório'),
  email: yup.string().email('E-mail inválido').required('obrigatório'),
  password: yup.string().min(8, 'A senha deve ter pelo menos 8 caracteres').required('A senha é obrigatória'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem')
    .required('A confirmação de senha é obrigatória')
}); /* Valida todos os campos com regras claras.
Usa .oneOf() para garantir que a confirmação da senha bate com a senha. */

const { handleSubmit, meta } = useForm({
  validationSchema: schema
});

const { value: username, errorMessage: usernameError } = useField<string>('username');
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: first_name, errorMessage: firstNameError } = useField<string>('first_name');
const { value: last_name, errorMessage: lastNameError } = useField<string>('last_name');
const { value: password, errorMessage: passwordError } = useField<string>('password');
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword');
/* Cada campo tem value e errorMessage gerenciado pela lib vee-validate. */

const isUsernameAvailable = ref(false);
const isEmailAvailable = ref(false);

const checkUsernameAvailability = async () => {
  if (!username.value) return;
  try {
    const res = await fetch(`https://mpfback-twitterclone.onrender.com/api/users/check-username/?username=${username.value}`);
    const data = await res.json();
    isUsernameAvailable.value = !data.username_exists;
  } catch (e) {
    console.log(e)
    isUsernameAvailable.value = false;
  }
};/* Chama endpoints da API para verificar se já existe um nome de usuário;
Mostra erro condicional caso esteja em uso.*/

const checkEmailAvailability = async () => {
  if (!email.value) return;
  try {
    const res = await fetch(`https://mpfback-twitterclone.onrender.com/api/users/check-email/?email=${email.value}`);
    const data = await res.json();
    isEmailAvailable.value = !data.email_exists;
  } catch (e) {
    console.log(e)
    isEmailAvailable.value = false;
  }
};/* Chama endpoints da API para verificar se já existe um email de usuário;
Mostra erro condicional caso esteja em uso.*/

const register = async () => {
  if (password.value !== confirmPassword.value) {
    alert("As senhas não coincidem.");
    return;
  }

  try {
    const response = await fetch("https://mpfback-twitterclone.onrender.com/api/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: first_name.value,
        last_name: last_name.value,
        username: username.value.toLowerCase(),
        email: email.value.toLowerCase(),
        password: password.value,
      }),
    });

    if (response.ok) {
      alert("Cadastro realizado com sucesso!");
      router.push('/login');
    } else {
      const errorData = await response.json();
      console.error("Erro no cadastro:", errorData);
      alert("Erro ao registrar. Verifique os dados.");
    }
  } catch (err) {
    console.error("Erro de conexão:", err);
    alert("Erro ao conectar ao servidor.");
  }
}
/* Verifica novamente se as senhas batem;
Envia um POST com os dados do usuário;
Em caso de sucesso: alert e redirecionamento para /login;
Em caso de erro: mostra alertas e loga no console. */

const submitForm = handleSubmit(register);
</script>

<template>
  <div class="container">
    <img alt="xplace logo" src="@/assets/logo2.png" class="logo" />
    <h2> Registre no XPlace</h2>
    <form @submit.prevent="submitForm">
      <div class="group">
        <div class="input-field">
          <input type="text" placeholder="nome" v-model="first_name" />
          <span v-if="firstNameError" class="error">{{ firstNameError }}</span>
        </div>
        <div class="input-field">
          <input type="text" placeholder="sobrenome" v-model="last_name" />
          <span v-if="lastNameError" class="error">{{ lastNameError }}</span>
        </div>
      </div>

      <div class="input-field">
        <input type="text" placeholder="email" v-model="email"
          @blur="() => { emailTouched = true; checkEmailAvailability(); }" />
        <span v-if="emailError" class="error">{{ emailError }}</span>
        <span v-else-if="emailTouched && !isEmailAvailable" class="error">Este email já está em uso</span>
      </div>
      <div class="input-field">
        <input type="text" placeholder="usuário" v-model="username"
          @blur="() => { usernameTouched = true; checkUsernameAvailability(); }" />
        <span v-if="usernameError" class="error">{{ usernameError }}</span>
        <span v-else-if="usernameTouched && !isUsernameAvailable" class="error">Este nome de usuário já está em
          uso</span>
      </div>
      <div class="input-field password">
        <input :type="showPassword ? 'text' : 'password'" placeholder="senha" v-model="password" />
        <span @click="showPassword = !showPassword" class="toggle-icon">
          <Eye v-if="!showPassword" />
          <EyeOff v-else />
        </span>
        <span v-if="passwordError" class="error">{{ passwordError }}</span>
      </div>
      <div class="input-field password">
        <input :type="showConfirmPassword ? 'text' : 'password'" placeholder="confirme a senha"
          v-model="confirmPassword" />
        <span @click="showConfirmPassword = !showConfirmPassword" class="toggle-icon">
          <Eye v-if="!showConfirmPassword" />
          <EyeOff v-else />
        </span>
        <span v-if="confirmPasswordError" class="error">{{ confirmPasswordError }}</span>
      </div>
      <button type="submit" :disabled="!meta.valid || !isUsernameAvailable || !isEmailAvailable">
        Registrar
      </button>
      <!--
      Garante que o botão só funciona quando:
      O formulário é válido;
      O email e o nome de usuário estão livres.
      -->
      <h4>Já é cadastrado? <a href="/login">Entre aqui</a></h4>
    </form>
  </div>
</template>

<style scoped>
.input-field.password {
  position: relative;
}

.toggle-icon {
  opacity: 0.8;
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--blue-dust);
}

.error {
  color: var(--error-red);
  font-size: 12px;
}

.group {
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.group>.input-field {
  width: 140px;
}

a {
  text-decoration: none;
  font-weight: 800;
  color: var(--blue-midnight);
}

.input-field {
  display: flex;
  flex-direction: column;
  border-radius: 6px;
  border: 2px solid var(--blue-cream);
  background-color: var(	--blue-background);
  height: 40px;
  width: 300px;
  margin-top: 10px;
}

h4 {
  color: var(--blue-midnight);
  font-size: 14px;
  font-weight: 500;
  margin-top: 8px;
}

h5 {
  color: var(--blue-midnight);

  font-size: 12px;
  font-weight: 500;
  align-self: flex-end;
  margin-right: 20px;
  margin-top: 4px;
}

input {
  height: 100%;
  background-color: transparent;
  border: none;
  outline: none;
  color: var(--blue-dust);
  font-weight: 400;
  font-size: 20px;
  align-items: center;
  text-align: center;
  justify-content: center;
}

h2 {
  color: var(--blue-midnight);
}

button {
  background-color: var(--blue-sky);
  border: none;
  width: 60%;
  height: 40px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  margin-top: 20px;
  color: var(--blue-cream);
}

button:hover {
  background-color: var(--blue-accent);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  height: 100px;
  width: 100px;
  margin-top: 40px;
  border-radius: 16%;
}

.container {
  height: 600px;
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: var(--blue-background);
  border-radius: 16px;

  @media screen and (max-width: 900px) {
    background-color: var(--blue-container);
  }
}

h2 {
  margin: 20px;
}
</style>
