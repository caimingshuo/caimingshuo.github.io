---
title: SMPL&FLAME

date: 2024-08-26 17:00:00 +0800

categories: [3D computer vision, Face, Body]

tags: [3D computer vision, Face, Body]

math: true

mermaid: true

description: 

---



#### PointAvatar: Deformable Point-based Head Avatars from Videos

The ability to create realistic animatable and relightable head avatars from casual video sequences would open up wide ranging applications in communication and entertainment. Current methods either build on explicit 3D morphable meshes (3DMM) or exploit neural implicit representations. The former are limited by fixed topology, while the latter are non-trivial to deform and inefficient to render. Furthermore, existing approaches entangle lighting in the color estimation, thus they are limited in re-rendering the avatar in new environments. In contrast, we propose PointAvatar, a deformable point-based representation that disentangles the source color into intrinsic albedo and normal-dependent shading. We demonstrate that PointAvatar bridges the gap between existing mesh- and implicit representations, combining high-quality geometry and appearance with topological flexibility, ease of deformation and rendering efficiency. We show that our method is able to generate animatable 3D avatars using monocular videos
from multiple sources including hand-held smartphones, laptop webcams and internet videos, achieving state-of-theart quality in challenging cases where previous methods fail, e.g., thin hair strands, while being significantly more efficient in training than competing methods.

![image-20240918175828068](../../cfcys.github.io/_posts/images/img_dip/image-20240918175828068.png)

从随意的视频序列中创建逼真的可动画化和可灯光化头像的能力将在通信和娱乐领域开辟广泛的应用。目前的方法要么建立**在显式三维变形网格(3DMM)**上，要么利用神经隐式表征。前者受固定拓扑结构的限制，而后者易变形且渲染效率低。此外，现有的方法在颜色估计中纠缠光照，因此它们在新环境中重新渲染角色时受到限制。相比之下，我们提出了PointAvatar，这是一种可变形的基于点的表示，它将源颜色分解为内在反照率和法线相关的阴影。我们演示了PointAvatar在现有的网格表示和隐式表示之间架起了桥梁，将高质量的几何形状和外观与拓扑灵活性、易于变形和渲染效率相结合。我们表明，我们的方法能够使用来自多个来源的单目视频(包括手持智能手机，笔记本电脑网络摄像头和互联网视频)生成可动画的3D化身，在以前的方法失败的具有挑战性的情况下(例如，细发丝)实现最先进的质量，同时在训练中显着比竞争方法更有效。

#### HeadGAP: Few-shot 3D Head Avatar via Generalizable Gaussian Priors

In this paper, we present a novel 3D head avatar creation approach capable of generalizing from few-shot in-the-wild data with high-fidelity and animatable robustness. Given the underconstrained nature of this problem, incorporating prior knowledge is essential. Therefore, we propose a
framework comprising prior learning and avatar creation phases. The prior learning phase leverages 3D head priors derived from a large-scale multi-view dynamic dataset, and the avatar creation phase applies these priors for fewshot personalization. Our approach effectively captures these priors by utilizing a Gaussian Splatting-based autodecoder network with part-based dynamic modeling. Our method employs identity-shared encoding with personalized latent codes for individual identities to learn the attributes of Gaussian primitives. During the avatar creation phase, we achieve fast head avatar personalization by leveraging inversion and fine-tuning strategies. Extensive experiments demonstrate that our model effectively exploits head priors and successfully generalizes them to few-shot personalization, achieving photo-realistic rendering quality, multi-view consistency, and stable animation.

## 参考资料

> 
>

