function toggleForm(id) {
  const el = document.getElementById("form-" + id);
  el.style.display = el.style.display === "block" ? "none" : "block";
}

function rate(el, value) {

  const stars = el.parentElement.children;

  for (let i = 0; i < stars.length; i++) {
      stars[i].classList.remove("active");
  }

  for (let i = 0; i < value; i++) {
      stars[i].classList.add("active");
  }

  el.closest("form").querySelector("input[name='rating']").value = value;
}