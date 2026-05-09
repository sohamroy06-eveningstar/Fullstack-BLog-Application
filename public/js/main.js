document.addEventListener('DOMContentLoaded', function () {

    fetch('/posts')

        .then((response) => response.json())

        .then((posts) => {

            console.log(posts);

            const postContainer =
                document.getElementById('posts');



            postContainer.innerHTML = posts

                .map((post) => {

                    // CATEGORY FIX

                    const category =

                        (post.category || "uncategorized")

                        .toLowerCase();



                    // SEO SLUG

                    const slug = encodeURIComponent(

                        post.title

                            .trim()

                            .replace(/\s+/g, "-")

                            .toLowerCase()

                    );



                    return `

                        <div class="post ${category}">

                            ${

                                post.image

                                ? `

                                    <img

                                        class="post-img"

                                        src="${post.image}"

                                        alt="${post.title}"

                                    >

                                  `

                                : ""

                            }

                            <h3 class="post-category">

                                ${category}

                            </h3>

                            <a href="/post-details/${slug}">

                                <h2 class="post-title">

                                    ${post.title}

                                </h2>

                            </a>

                            <div class="post-desc">

                                ${post.content}

                            </div>

                            <a

                                href="/post-details/${slug}"

                                class="read-more"

                            >

                                Read More

                            </a>

                        </div>

                    `;

                })

                .join("");

        })

        .catch((error) => {

            console.error(

                "Error fetching posts:",

                error

            );



            const postContainer =

                document.getElementById('posts');



            postContainer.innerHTML =

                "<p>Error fetching posts.</p>";

        });

});



// HEADER SHADOW

let header = document.querySelector("header");

window.addEventListener("scroll", () => {

    header.classList.toggle(

        "shadow",

        window.scrollY > 0

    );

});